import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function RoutinesPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState(null);

  // Fetch all routines
  const {
    data: routines,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["routines"],
    queryFn: async () => {
      const res = await fetch(
        "https://fitnesstrac-kr.herokuapp.com/api/routines"
      );
      if (!res.ok) throw new Error("Failed to load routines");
      return res.json();
    },
  });

  // Create a new routine
  const createRoutineMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        "https://fitnesstrac-kr.herokuapp.com/api/routines",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, goal }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      return data;
    },
    onSuccess: () => {
      setName("");
      setGoal("");
      setError(null);
      queryClient.invalidateQueries(["routines"]);
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createRoutineMutation.mutate();
  };

  return (
    <section>
      <h1>All Routines</h1>

      {token && (
        <form onSubmit={handleSubmit}>
          <h2>Create a New Routine</h2>
          <label>
            Name:
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Goal:
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={createRoutineMutation.isLoading}>
            Create Routine
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}

      {isLoading && <p>Loading routines...</p>}
      {fetchError && <p>Error loading routines.</p>}

      <ul>
        {routines?.map((routine) => (
          <li key={routine.id}>
            <Link to={`/routines/${routine.id}`}>{routine.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
