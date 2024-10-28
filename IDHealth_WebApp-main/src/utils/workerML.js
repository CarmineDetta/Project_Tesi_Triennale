const workercode = () => {
  self.onmessage = async (event) => { // eslint-disable-line no-restricted-globals
    //const tf = self.importScripts("@tensorflow/tfjs"); // eslint-disable-line no-restricted-globals
    self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs'); // eslint-disable-line no-restricted-globals

    const { data } = event;
    if(!data.model && !data.measuraments) return;

    const { modelJson, measuraments } = data;

    // Converti i valori glicemici in numeri
    const glucoseValues = measuraments.map((m) => parseFloat(m.value));
    // Converti le date in timestamp
    const timestamps = measuraments.map((m) => new Date(m.dateTime).getTime());
    self.postMessage({ action: "progress", progress: 25 }); // eslint-disable-line no-restricted-globals

    // Crea i tensor per addestrare il modello
    const xs = tf.tensor2d(timestamps, [timestamps.length, 1]); // eslint-disable-line
    const ys = tf.tensor2d(glucoseValues, [glucoseValues.length, 1]); // eslint-disable-line

    const model = await tf.models.modelFromJSON(JSON.parse(modelJson)); // eslint-disable-line
    await model.compile({ optimizer: "adam", loss: 'meanSquaredError' });
    self.postMessage({ action: "progress", progress: 50 }); // eslint-disable-line no-restricted-globals
    await model.fit(xs, ys, { epochs: 10 });
    self.postMessage({ action: "progress", progress: 75 }); // eslint-disable-line no-restricted-globals

    const weights = model.getWeights().map(w => ({ data: w.arraySync(), shape: w.shape }));
    self.postMessage({ action: "data", weights }); // eslint-disable-line no-restricted-globals
  };
};

let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], { type: "application/javascript" });
const worker_script = URL.createObjectURL(blob);

export default worker_script;
  