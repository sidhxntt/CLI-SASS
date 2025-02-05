// Purpose: Error handling middleware for the application.

const error_handling = (err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
};

export default error_handling;
