const emoji={dog:'🐶',cat:'🐱',rabbit:'🐰',bird:'🐦'};
export default function PetAvatar({pet,size='normal'}){return <div className={`pet-avatar avatar-${pet?.species||'dog'} avatar-${size}`} aria-label={`${pet?.species||'pet'} avatar`}>{emoji[pet?.species]||'🐾'}</div>}
