## 🌱 Zukini – Smart Study Tool for Digital Notes & Flashcards  
**Zukini** is an intelligent study tool that helps users scan, store, and organize digital notes into flashcards and mock tests. Designed for students and professionals, it enhances learning efficiency with AI-powered text parsing and seamless flashcard creation.

---

## 🚀 **Features**
✅ **Scan & Store Notes** – Upload scanned documents and extract text using AI.  
✅ **Flashcard Generation** – Automatically create flashcards from scanned notes.  
✅ **Mock Tests** – Convert notes into interactive quizzes for self-assessment.  
✅ **User Authentication & Email Verification** – Secure login with email verification.  
✅ **Multi-Device Access** – Sync your notes and study materials across devices.  

---

## 🛠️ **Tech Stack**
- **Frontend:** React, Tailwind CSS  
- **Backend:** Node.js, Express, PostgreSQL  
- **Database:** Amazon RDS (PostgreSQL)  
- **Authentication:** JWT, bcrypt, email verification  
- **AI Integration:** Google Vision API for text extraction  
- **Hosting:**  
  - **Frontend:** AWS AMPLIFY (HTTPS)  
  - **Backend:** AWS EC2 with Nginx Reverse Proxy  
- **Deployment:** PM2 process manager, Certbot SSL, AMPLIFY

---

## 🔧 **Setup & Installation**
### **1️⃣ Clone the repository**
```bash
git clone https://github.com/AnthonyL103/NoteLetApp.git
cd NoteLetApp
```

### **2️⃣ Install dependencies**
#### **Backend**
```bash
cd backend
npm install
```

#### **Frontend**
```bash
cd frontend
npm install
```

### **3️⃣ Set up environment variables**
Create a `.env` file inside `backend/` and add:
```
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=your_rds_host
EMAIL=your_email
PASS=your_email_app_password
OPENAI_API_KEY=your_openai_key
```

### **4️⃣ Run the backend**
```bash
npm start
```

### **5️⃣ Run the frontend**
```bash
npm start
```

---

## 🌎 **Live Demo**
🚀 **Visit:** [www.zukini.com](https://www.zukini.com)

---

## 🎯 **Roadmap**
- [ ] Implement AI-powered **note summarization**  
- [ ] Add **collaborative study** mode  
- [ ] Improve UI for **flashcard organization**
- [ ] Make styling more **dynamic**
- [ ] Mobile app version (React Native)  

---

## ✉️ **Contact**
💡 **Anthony Li**  
📧 Email: [your-email@example.com](mailto:your-email@example.com)  
🔗 GitHub: [@AnthonyL103](https://github.com/AnthonyL103)  

---
