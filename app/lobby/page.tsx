"use client"

import Button from '@mui/material/Button';
import { IconButton, TextField } from '@mui/material';
import { LocalPhone } from '@mui/icons-material'
import React, { useEffect, useRef, useState } from "react"
import Peer from "simple-peer"
import io from "socket.io-client"


function App() {
	const [me, setMe] = useState("")
	const [stream, setStream] = useState<any>()
	const [receivingCall, setReceivingCall] = useState(false)
	const [caller, setCaller] = useState("")
	const [callerSignal, setCallerSignal] = useState<any>()
	const [callAccepted, setCallAccepted] = useState(false)
	const [idToCall, setIdToCall] = useState("")
	const [callEnded, setCallEnded] = useState(false)
	const [name, setName] = useState("")
	const myVideo = useRef<any>()
	const userVideo = useRef<any>()
	const connectionRef = useRef<any>()
	const [socket2, setSocket2] = useState<any>()
	const [myName, setMyName] = useState('')

	// useEffect(() => {
	// 	console.log('Setting up socket and media devices');

	// 	navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
	// 		console.log('Media devices initialized');
	// 		setStream(stream);
	// 		if (myVideo.current) {
	// 			myVideo.current.srcObject = stream;
	// 		}
	// 	});
	// }, []);

	// const thisfun = () => {
	// 	socket.on("connect", () => {
	// 		socket.on('me', (id) => {
	// 			console.log(socket.id);
	// 			console.log('Received me event with ID:', id);
	// 			setMe(id);
	// 		});
	// 		socket.on("callUser", (data) => {
	// 			setReceivingCall(true)
	// 			setCaller(data.from)
	// 			setName(data.name)
	// 			setCallerSignal(data.signal)
	// 		})
	// 	});
	// }
	// useEffect(() => {
	// 	thisfun()
	// }, [socket, thisfun]);

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			console.log('Media devices initialized');
			setStream( stream);
			if (myVideo.current) {
				myVideo.current.srcObject = stream;
			}
		});
	}, []);

	useEffect(() => {
		let socket = io('https://webrtc-c6vy.onrender.com'); 

		socket.connect();

		setSocket2(socket.connect())

		socket.on("connect", () => {
			socket.on('me', (id:any) => {
				console.log(socket.id);
				console.log('Received me event with ID:', id);
				setMe(id);
			});
			socket.on("callUser", (data:any) => {
				setReceivingCall(true);
				setCaller(data.from);
				setName(data.name);
				setCallerSignal(data.signal);
			});
			
		});


		return () => {
			socket.off("connect");
			socket.off("me");
			socket.off("callUser");
		};
	}, [])

	const callUser = (id: any) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket2?.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: myName
			})
		})
		peer.on("stream", (stream) => {
			if (userVideo.current) {
				userVideo.current.srcObject = stream
			}

		})
		socket2?.on("callAccepted", (signal:any) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}

	const answerCall = () => {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket2?.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			if (userVideo.current) {
				userVideo.current.srcObject = stream
			}
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy();
		window.location.reload();
	}

	return (
		<>
			<h1 style={{ textAlign: "center", color: '#fff' }}>Audio call</h1>
			<div className="container">
				<div className="video-container">
					<div className="video">
						<p>Desktop :</p>
						{stream && <video playsInline ref={myVideo} autoPlay style={{ width: "300px" }} />}
					</div>
					<div className="video">
						{/* {name ? <p>{name} :</p>: null} */}
						<p>Remote :</p>
						{callAccepted && !callEnded ?
							<video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} /> :
							null}
					</div>
				</div>
				<div className="myId">
					<TextField
						id="filled-basic"
						label="Name"
						variant="filled"
						value={myName}
						onChange={(e) => setMyName(e.target.value)}
						style={{ marginBottom: "20px" }}
					/>
					<p>My id : {me}</p>

					<TextField
						id="filled-basic"
						label="ID to call"
						variant="filled"
						value={idToCall}
						onChange={(e) => setIdToCall(e.target.value)}
					/>
					<div className="call-button">
						{callAccepted && !callEnded ? (
							<Button variant="contained" color="secondary" onClick={leaveCall}>
								End Call
							</Button>
						) : (
							<IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
								<LocalPhone fontSize="large" />
							</IconButton>
						)}
						{idToCall}
					</div>
				</div>
				<div>
					{receivingCall && !callAccepted ? (
						<div className="caller">
							<h1 >{name} is calling...</h1>
							<Button variant="contained" color="primary" onClick={answerCall}>
								Answer
							</Button>
						</div>
					) : null}
				</div>
			</div>
		</>
	)
}

export default App
