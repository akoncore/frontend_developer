interface Props {
  cover?: string;
  label?: string;
  variant?: 'card' | 'hero' | 'detail';
}
export default function ImageSlot({
  cover,
  label = 'ARTICLE IMAGE',
  variant = 'card',
}: Props) {
  return (
    <div className={`image-slot image-slot--${variant}`}>
      {cover ? (
        <img src={cover} alt={label} loading="lazy" />
      ) : (
        <span className="image-slot__text">{label}</span>
      )}
    </div>
  );
}
