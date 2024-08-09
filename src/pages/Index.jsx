const CommentPreview = ({ storyId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['comments', storyId],
    queryFn: () => fetchComments(storyId),
  });

  if (isLoading) return <div>Loading comments...</div>;
  if (error) return <div>Error loading comments: {error.message}</div>;

  return (
    <div className="max-h-[300px] overflow-y-auto">
      {data.children.slice(0, 5).map((comment) => (
        <div key={comment.id} className="mb-4 p-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{comment.author}</p>
          <p className="text-sm" dangerouslySetInnerHTML={{ __html: comment.text }}></p>
        </div>
      ))}
    </div>
  );
};
