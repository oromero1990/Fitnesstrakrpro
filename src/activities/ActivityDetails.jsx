import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";

export default function ActivityDetails() {
  const { activityId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: activity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activity", activityId],
    queryFn: async () => {
      const res = await fetch(
        `https://fitnesstrac-kr.herokuapp.com/api/activities/${activityId}`
      );
      if (!res.ok) throw new Error("Failed to fetch activity.");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `https://fitnesstrac-kr.herokuapp.com/api/activities/${activityId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete activity.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      navigate("/");
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading activity.</p>;

  return (
    <div>
      <h2>{activity.name}</h2>
      <p>{activity.description}</p>
      <p>
        <strong>Created by:</strong> {activity.creatorName}
      </p>
      {token && (
        <button onClick={() => deleteMutation.mutate()}>Delete Activity</button>
      )}
    </div>
  );
}
