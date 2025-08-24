export function buildContent(evt) {
  const { type, sourceUserId, data = {} } = evt;
  switch (type) {
    case 'LIKE':
      return { title: `${sourceUserId} liked your post`, body: 'Tap to view', entity: { postId: data.postId } };
    case 'COMMENT':
      return { title: `${sourceUserId} commented`, body: data.snippet || 'New comment', entity: { postId: data.postId, commentId: data.commentId } };
    case 'FOLLOW':
      return { title: `${sourceUserId} started following you`, body: 'Say hi!', entity: {} };
    case 'POST_CREATE':
      return { title: `${sourceUserId} posted new content`, body: data.title || 'Check it out', entity: { postId: data.postId } };
    case 'MESSAGE':
      return { title: `New message from ${sourceUserId}`, body: data.snippet || 'Open message', entity: { threadId: data.threadId } };
    default:
      return { title: 'Activity', body: 'You have a new notification', entity: {} };
  }
}
