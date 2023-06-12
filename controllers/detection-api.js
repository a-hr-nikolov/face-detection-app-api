const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set('authorization', 'Key 99ffb1859828459aa26dea23b7c089df');

const handleDetect = (req, res) => {
  const { url } = req.query;

  stub.PostModelOutputs(
    {
      model_id: 'face-detection',
      inputs: [
        {
          data: {
            image: {
              url,
            },
          },
        },
      ],
    },
    metadata,
    (err, response) => {
      if (err) {
        console.log('Error: ' + err);
        res.json("Model doesn't exist");
        return;
      }

      if (response.status.code !== 10000) {
        console.log(
          'Received failed status: ' +
            response.status.description +
            '\n' +
            response.status.details
        );
        res.json(response.status.details);
        return;
      }
      res.json(response.outputs[0].data);
    }
  );
};

module.exports = { handleDetect };
