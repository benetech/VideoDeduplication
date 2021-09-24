import useHandleTaskEvents from "../application/api/tasks/useHandleTaskEvents";

export default function HandleSocketEvents(): JSX.Element | null {
  // Handle socket events
  useHandleTaskEvents();

  // Render nothing
  return null;
}
