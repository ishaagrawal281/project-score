import { useParams } from "react-router-dom";

function SharePage() {
  const { shareId } = useParams();

  return (
    <>
      <h1>Shared Document</h1>
      <p>Share ID: {shareId}</p>
    </>
  );
}

export default SharePage;