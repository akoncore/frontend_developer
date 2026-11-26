import { store } from './index';
import { fetchPosts, fetchPost } from './postsSlice';
import { fetchCommunity, fetchCommunityDetail } from './communitySlice';
// Browser events stay outside Redux state; all application data is refreshed via thunks.
export function refreshData() {
  const state = store.getState();
  const tasks = [store.dispatch(fetchPosts(true))];
  for (const id of Object.keys(state.posts.details))
    void store.dispatch(fetchPost({ id, force: true }));
  for (const key of Object.keys(state.community.feeds))
    void store.dispatch(
      fetchCommunity({
        uid: key === 'guest' ? null : key.slice(5),
        force: true,
      }),
    );
  for (const id of Object.keys(state.community.details))
    void store.dispatch(fetchCommunityDetail({ id, force: true }));
  return Promise.all(tasks);
}
