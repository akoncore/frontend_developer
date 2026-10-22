import { useState } from "react";
import { Bird, Cat, PawPrint, Rabbit } from "lucide-react";
import golden from "../assets/golden-retriever.jpg";
import terrier from "../assets/terrier.jpg";
import labrador from "../assets/labrador.jpg";

const icons = { dog: PawPrint, cat: Cat, rabbit: Rabbit, bird: Bird };
const dogPhotos = [golden, terrier, labrador];

export default function PetAvatar({ pet, size = "normal" }) {
  const [failedSource, setFailedSource] = useState(null);
  const species = pet?.species || "dog";
  const Icon = icons[species] || PawPrint;
  // Use an uploaded photo first; supplied dog photos illustrate demo profiles.
  const photoIndex =
    Array.from(String(pet?.id || pet?.name || "")).reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0,
    ) % dogPhotos.length;
  const source =
    pet?.photo || (species === "dog" ? dogPhotos[photoIndex] : null);

  return (
    <div className={`pet-avatar avatar-${species} avatar-${size}`}>
      {source && source !== failedSource ? (
        <img
          src={source}
          alt={`${pet?.name || "Pet"} portrait`}
          loading="lazy"
          onError={() => setFailedSource(source)}
        />
      ) : (
        <Icon role="img" aria-label={`${species} avatar`} />
      )}
    </div>
  );
}
