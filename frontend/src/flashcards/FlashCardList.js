import Flashcard from './FlashCard';

const FlashcardList = ({ flashcards = [] }) => {
    

    return (
        <div className="card-grid">
            {flashcards.map((flashcard) => (
                <Flashcard key={flashcard.id} flashcard={flashcard}  />
            ))}
        </div>
    );
};

export default FlashcardList;
