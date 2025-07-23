import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function RoutineDetails() {
  const { routineId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activityId, setActivityId] = useState("");
  const [count, setCount] = useState("");
  const [error, setError] = useState("");

  // Get routine details
  const { data: routine, isLoading } = useQuery({
    queryKey: ["routine", routineId],
    queryFn: async () => {
      const res = await fetch(
        `https://fitnesstrac-kr.herokuapp.com/api/routines/${routineId}`
      );
      if (!res.ok) throw new Error("Failed to load routine");
      return res.json();
    },
  });

  // Get list of all activities (for dropdown)
  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await fetch(
        "https://fitnesstrac-kr.herokuapp.com/api/activities"
      );
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    },
  });

  // Add a set
  const addSet = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `https://fitnesstrac-kr.herokuapp.com/api/routines/${routineId}/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            activityId: Number(activityId),
            count: Number(count),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      return data;
    },
    onSuccess: () => {
      setActivityId("");
      setCount("");
      queryClient.invalidateQueries(["routine", routineId]);
    },
    onError: (err) => setError(err.message),
  });

  // Delete routine
  const deleteRoutine = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `https://fitnesstrac-kr.herokuapp.com/api/routines/${routineId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Could not delete routine");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["routines"]);
      navigate("/routines");
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (!routine) return <p>Routine not found</p>;

  return (
    <div>
      <h1>{routine.name}</h1>
      <p>
        <strong>Goal:</strong> {routine.goal}
      </p>
      <p>
        <strong>Creator:</strong> {routine.creatorName}
      </p>

      {token && (
        <button onClick={() => deleteRoutine.mutate()}>Delete Routine</button>
      )}

      <h2>Sets</h2>
      {routine.activities?.length ? (
        <ul>
          {routine.activities.map((set) => (
            <li key={set.routineActivityId}>
              {set.name} - {set.count} reps
            </li>
          ))}
        </ul>
      ) : (
        <p>No sets yet. Add one below!</p>
      )}

      {token && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addSet.mutate();
          }}
        >
          <h3>Add a Set</h3>
          <label>
            Activity:
            <select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              required
            >
              <option value="">Select one</option>
              {activities?.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Reps:
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              required
            />
          </label>
          <button type="submit">Add Set</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
