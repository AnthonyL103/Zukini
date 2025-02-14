import Flashcard from './FlashCard'

const FlashcardList = ({ flashcards = [] }) => {
    return (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(500px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(275px,1fr))]">
            {flashcards.map((flashcard) => (
                <Flashcard key={flashcard.id} flashcard={flashcard} />
            ))}
        </div>
    )
}

export default FlashcardList
