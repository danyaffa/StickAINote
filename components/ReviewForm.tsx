import { useState } from "react";
import { addReview } from "../lib/firestore";

export default function ReviewForm({ userId }: { userId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if(!comment.trim()) return;
    await addReview(userId, rating, comment);
    setSent(true);
  };

  if (sent) return <p className="text-green-400">Thanks for your feedback!</p>;

  return (
    <div className="p-4 bg-gray-800 rounded-lg mt-4">
      <h3 className="text-white font-bold mb-2">Rate StickAINote</h3>
      <div className="flex gap-2 mb-2">
        {[1,2,3,4,5].map(star => (
          <button key={star} onClick={() => setRating(star)} className="text-2xl">
            {star <= rating ? "⭐" : "☆"}
          </button>
        ))}
      </div>
      <textarea 
        className="w-full p-2 rounded bg-gray-900 text-white"
        placeholder="Write a review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button 
        onClick={handleSubmit}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-full font-bold"
      >
        Submit Review
      </button>
    </div>
  );
}
