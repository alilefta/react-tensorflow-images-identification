import * as mobilenet from "@tensorflow-models/mobilenet";
import { useState, useEffect, useRef } from "react";
function App() {
	const [isModelLoading, setModelLoading] = useState(false);
	const [model, setModel] = useState(null);
	const [imageURL, setImageURL] = useState(null);
	const [results, setResults] = useState([]);
	const [history, setHistory] = useState([]);

	const imageRef = useRef();
	const textInputRef = useRef();
	const fileInputRef = useRef();
	const loadModel = async () => {
		setModelLoading(true);
		try {
			const model = await mobilenet.load();
			setModel(model);
			setModelLoading(false);
		} catch (err) {
			console.log(err);
			setModelLoading(false);
		}
	};

	const identify = async () => {
		textInputRef.current.value = "";
		const results = await model.classify(imageRef.current);
		setResults(results);
	};

	const uploadImage = (e) => {
		const { files } = e.target;
		if (files.length > 0) {
			const url = URL.createObjectURL(files[0]);
			setImageURL(url);
		} else {
			setImageURL(null);
		}
	};

	const handleOnChange = (e) => {
		setImageURL(e.target.value);
		setResults([]);
	};

	const handleRecentImageClick = (image, e) => {
		if (history.length > 0) {
			if (e.target.src === history[0]) {
				setImageURL(image);
			} else {
				const newHistory = history.filter((img) => img !== image);
				setHistory(newHistory);
				setImageURL(image);
			}
		}
	};
	const triggerInput = () => {
		fileInputRef.current.click();
	};
	useEffect(() => {
		loadModel();
	}, []); // [] to make it run only one time
	useEffect(() => {
		if (imageURL) {
			setHistory((hist) => [imageURL, ...hist]);
		}
	}, [imageURL]);

	if (isModelLoading) {
		return <h2>Model loading ....</h2>;
	}

	return (
		<div className="App">
			<h1 className="header">Image Identification</h1>
			<div className="inputHolder">
				<input
					type="file"
					accept="image/*"
					capture="camera"
					className="uploadInput"
					onChange={uploadImage}
					ref={fileInputRef}
				/>
				<button className="uploadImage" onClick={triggerInput}>
					Upload Image
				</button>
				<span className="or">OR</span>
				<input
					type="text"
					placeholder="Paste an image URL"
					ref={textInputRef}
					onChange={handleOnChange}
				/>
			</div>
			<div className="mainWrapper">
				<div className="mainContent">
					<div className="imageHolder">
						{imageURL && (
							<img
								src={imageURL}
								alt="upload preview"
								crossOrigin="anonymous"
								ref={imageRef}
							/>
						)}
					</div>
					{results.length > 0 && (
						<div className="resultsHolder">
							{results.map((result, index) => (
								<div className="result" key={result.className}>
									<span className="name">{result.className}</span>
									<span className="confidence">
										Confidence level : {(result.probability * 100).toFixed(2)}%{" "}
										{index === 0 && (
											<span className="bestGuess">Best Guess</span>
										)}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
				{imageURL && (
					<button className="button" onClick={identify}>
						Identify Image
					</button>
				)}
			</div>
			{history.length > 0 && (
				<div className="recentPredictions">
					<h2>Recent Images</h2>
					<div className="recentImages">
						{history.map((image, index) => (
							<div className="recentPrediction" key={`${image}${index}`}>
								<img
									src={image}
									alt="Recent Prediction"
									onClick={(event) => handleRecentImageClick(image, event)}
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
