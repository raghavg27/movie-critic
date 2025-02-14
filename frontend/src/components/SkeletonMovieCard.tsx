const SkeletonMovieCard = () => {
  return (
    <div className="animate-pulse bg-gray-200 rounded-lg p-6 h-64 w-full">
      <div className="h-8 w-3/4 bg-gray-300 rounded mb-4"></div>
      <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
    </div>
  );
};

export default SkeletonMovieCard;
