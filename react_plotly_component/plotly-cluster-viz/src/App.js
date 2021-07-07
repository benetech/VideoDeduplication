import logo from "./logo.svg";
import "./App.css";
import Plot from "react-plotly.js";
import data from "./data.json";
import { useState } from "react";
console.log(data);

function App() {
  let cluster = [];
  let x = [];
  let y = [];
  let labels = [];
  let summaries = [];
  let [img, setImage] = useState("");
  let [figure, setFigure] = useState({});

  for (const i in data) {
    let obs = data[i];

    cluster.push(obs["cluster"]);
    x.push(obs["x"]);
    y.push(obs["y"]);
    labels.push(`<b>Cluster ID</b>: ${obs["cluster"]} </br> Filename:${obs["files"]}`);
    summaries.push(obs["summary_path"]);
  }

  const handleHover = (a, b) => {
    const ind = a["points"][0]["pointIndex"];
    const img_url = a["points"][0]["data"]["summaries"][ind];
    // assumes all images have been placed on a folder called frame_summaries inside the public folder
    const images_folder = "frame_summaries"
    const img_path = `${images_folder}/${img_url}`
    setImage(img_path);
  };

  return (
    <div className="App">
      <Plot
        onHover={handleHover}
        // onInitialized={(figure) => setFigure(figure)}
        // onUpdate={(figure) => setFigure(figure)}
        data={[
          {
            x: x,
            y: y,
            summaries: summaries,
            type: "scatter",
            mode: "markers",
            marker: {
              color: cluster,
            },
            text: labels,
          },
          { mode: "markers" },
        ]}
        layout={{
          width: 1200,
          height: 600,
          title: "Visualization of a Video Library",
        }}
      />
      <div>
        <img src={img} />
      </div>
    </div>
  );
}

export default App;
