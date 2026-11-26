import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectSavedIds } from '../store/selectors';
import { toggleSaved } from '../store/readingSlice';
import { readerKey } from '../store/communitySlice';
export default function SaveStoryButton({ id }: { id: number }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const saved = useAppSelector((state) =>
    selectSavedIds(state, uid).includes(id),
  );
  const dispatch = useAppDispatch();
  return (
    <button
      type="button"
      className="clear-button"
      aria-pressed={saved}
      onClick={() => dispatch(toggleSaved({ reader: readerKey(uid), id }))}
    >
      {saved ? 'Saved for this session' : 'Save for this session'}
    </button>
  );
}
