terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"  
    }
  }
}

provider "aws" {
  region = "us-west-2"  # Your region
}


resource "aws_launch_template" "zukini_template" {
  name_prefix   = "zukini-template"
  image_id      = "ami-0cfda823a0fc4e88e"
  instance_type = "t2.small"
  key_name      = "zukini-key"
  vpc_security_group_ids = ["sg-068e3daeda5e15279", "sg-053c014d58ec801c5"] 

  user_data = base64encode(<<EOF
#!/bin/bash
set -e  # Stop script on error
exec > /var/log/user-data.log 2>&1  # Log output for debugging

echo "Starting user data script at $(date)"  # Forces Terraform to detect changes

# Update system and install dependencies
echo "Updating system packages..."
sudo apt update -y
sudo apt install -y nginx git curl nodejs npm python3-pip build-essential net-tools python3 make g++

# Clone backend repo if not already present
# Clone backend repo if not already present
# Clone backend repo if not already present
cd /home/ubuntu
if [ ! -d "Zukini/backend" ]; then
  echo "Cloning Zukini backend repo..."
  git clone https://github.com/AnthonyL103/Zukini.git
else
  echo "Zukini backend repo already exists, pulling latest changes..."
  cd Zukini/backend
  sudo chown -R ubuntu:ubuntu .  
  export HOME=/home/ubuntu  
  sudo -u ubuntu git config --global --add safe.directory /home/ubuntu/Zukini/backend
  sudo -u ubuntu git reset --hard origin/main  
  sudo -u ubuntu git pull origin main
fi



# Ensure dependencies are installed
echo "Installing Node.js dependencies..."
cd /home/ubuntu/Zukini/backend
npm install
npm install --save @google-cloud/vision bcrypt pm2 nodemon express-list-endpoints

# Ensure no stale processes are running
echo "Killing old processes..."
for port in 5001 5002 5003 5005 5006; do
  sudo fuser -k $port/tcp || true
done
sudo pkill -f node || true
sudo pkill -f pm2 || true

# Start PM2 processes
echo "Starting PM2 processes..."
npx pm2 start ecosystem.config.js
npx pm2 save

sudo chown -R ubuntu:ubuntu /home/ubuntu/.pm2
sudo chmod -R 775 /home/ubuntu/.pm2

# Run the correct PM2 startup command
echo "Setting up PM2 as a system service..."
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo systemctl enable pm2-ubuntu
sudo systemctl restart pm2-ubuntu

# Restart services
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "User data script finished successfully at $(date)"  # Forces Terraform to recognize changes
EOF
  )

  # Forces instance replacement when the script updates
  lifecycle {
    create_before_destroy = true
  }
}


resource "aws_lb" "zukini_alb" {
  name               = "zukini-alb" 
  internal           = false
  load_balancer_type = "application"
  security_groups    = ["sg-068e3daeda5e15279", "sg-053c014d58ec801c5"]  
  subnets           = ["subnet-0808f06feea54df94", "subnet-07f7f3d986f211a70", "subnet-0ff7879cd731fe688", "subnet-0c064f12fd07fae84"]

  enable_deletion_protection = false

  tags = {
    Name = "Zukini-ALB"
  }
}

resource "aws_lb_target_group" "zukini_target_group" {
  name        = "zukini-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = "vpc-09d64440bb95753ac"
  target_type = "instance"

  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 2
  }

  tags = {
    Name = "Zukini-TargetGroup"
  }
}



resource "aws_lb_listener" "zukini_https_listener" {
  load_balancer_arn = aws_lb.zukini_alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:us-west-2:060795900722:certificate/baa52ade-f2cb-4a0b-af0e-77fd4c3c7a99"
 
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.zukini_target_group.arn
  }
}


resource "aws_autoscaling_group" "zukini_asg" {
  name                 = "zukini-asg"
  desired_capacity     = 1
  max_size            = 3
  min_size            = 1
  vpc_zone_identifier = ["subnet-0808f06feea54df94", "subnet-07f7f3d986f211a70", "subnet-0ff7879cd731fe688", "subnet-0c064f12fd07fae84"]  

  launch_template {
    id      = aws_launch_template.zukini_template.id
    version = "$Latest"
  }

  target_group_arns = [aws_lb_target_group.zukini_target_group.arn]

  lifecycle {
    create_before_destroy = true  
  }

  tag {
    key                 = "Name"
    value               = "Zukini-ASG-Instance"
    propagate_at_launch = true
  }
}


resource "aws_db_instance" "zukini_rds" {
  identifier          = "database-2"  
  instance_class      = "db.t4g.micro"  
  allocated_storage   = 20
  engine             = "postgres"
  storage_encrypted   = true
  publicly_accessible = true

  lifecycle {
    ignore_changes = [
      copy_tags_to_snapshot,
      performance_insights_enabled,
      skip_final_snapshot,
      max_allocated_storage
    ]
  }
}

resource "aws_amplify_app" "zukini_amplify" {
  name       = "Zukini"
  repository = "https://github.com/AnthonyL103/Zukini"

  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }
  lifecycle {
    ignore_changes = all
  }
}


