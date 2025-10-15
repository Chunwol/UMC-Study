const getStatus = (req, res) => {
  res.status(200).send(new Date().toLocaleDateString());
};

export default getStatus;