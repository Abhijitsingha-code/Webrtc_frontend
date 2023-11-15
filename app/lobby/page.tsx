"use client"

import Button from '@mui/material/Button';
import { IconButton, TextField } from '@mui/material';
import { LocalPhone } from '@mui/icons-material'
import React, { useEffect, useRef, useState } from "react"
import Peer from "simple-peer"
import io from "socket.io-client"
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import PhoneIcon from '@mui/icons-material/Phone';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import InCallInterFace from '@/components/InCallInterFace';


function App() {
	const [me, setMe] = useState("")
	const [stream, setStream] = useState<any>()
	const [receivingCall, setReceivingCall] = useState(false)
	const [caller, setCaller] = useState("")
	const [callerSignal, setCallerSignal] = useState<any>()
	const [callAccepted, setCallAccepted] = useState(false)
	const [idToCall, setIdToCall] = useState("")
	const [callEnded, setCallEnded] = useState(false)
	const [outgoingCall, setOutgoingCall] = useState(false)
	const [name, setName] = useState("")
	const myVideo = useRef<any>()
	const userVideo = useRef<any>()
	const connectionRef = useRef<any>()
	const [socket2, setSocket2] = useState<any>()
	const [myName, setMyName] = useState('');
	const route = useRouter()
	const [ringtone, setRingtone] = useState<any>();
	const [isMute, setIsMute] = useState<boolean>(false);
	const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(false);


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
		if (typeof window !== 'undefined') {
			const audio = new Audio('/ringtone.mp3');
			setRingtone(audio);
		}
	}, []);

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			console.log('Media devices initialized');
			setStream(stream);
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
			socket.on('me', (id: any) => {
				console.log(socket.id);
				console.log('Received me event with ID:', id);
				setMe(id);
			});
			socket.on("callUser", (data: any) => {
				setReceivingCall(true);
				setCaller(data.from);
				setName(data.name);
				setCallerSignal(data.signal);

				if (ringtone) {
					ringtone.play();
				}
			});
			socket?.on("leaveCall", (data: any) => {
				console.log(`${data.from} left the call.`);
				connectionRef?.current?.destroy();
				window.location.reload();
			});
		});
		return () => {
			socket.off("connect");
			socket.off("me");
			socket.off("callUser");
		};
	}, [ringtone])

	const callUser = (id: any) => {
		setOutgoingCall(true)
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
		socket2?.on("callAccepted", (signal: any) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer;
	}

	const answerCall = () => {
		setCallAccepted(true);
		ringtone.pause();
		ringtone.currentTime = 0;
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
		socket2?.emit("leaveCall", { from: me });
		setCallEnded(true)
		connectionRef?.current?.destroy();
		ringtone.pause();
		ringtone.currentTime = 0;
		window.location.reload();
	}

	const muteMic = () => {
		setIsMute(!isMute)
		stream.getAudioTracks().forEach((track: { enabled: boolean; }) => track.enabled = !track.enabled);
	}

	const switchAudioOutput = async (deviceType: any) => {
		setIsSpeakerOn(!isSpeakerOn)
		try {
			const audioOutputDevices = await navigator.mediaDevices.enumerateDevices();
			const selectedDevice = audioOutputDevices.find((device) => device.kind === 'audiooutput' && device.label.includes(deviceType));

			console.log(userVideo.current.srcObject)
			if (selectedDevice) {
				userVideo.current.setSinkId(selectedDevice.deviceId)
			} else {
				console.error(`No ${deviceType} found in audio output devices.`);
			}
		} catch (error) {
			console.error('Error switching audio output:', error);
		}
	};

	return (
		<>
			{receivingCall ?

				<>{callAccepted ?
					<InCallInterFace name={name} callAccepted={callAccepted} callEnded={callEnded} userVideo={userVideo} isSpeakerOn={isSpeakerOn} isMute={isMute} muteMic={muteMic} switchToSpeaker={switchAudioOutput} leaveCall={leaveCall} />
					:
					<div className="flex min-h-screen flex-col items-center justify-between p-24">
						<div className='flex flex-col gap-4 items-center'>
							<p className='text-white font-bold text-xl'>Incoming Call</p>
						</div>
						<Avatar sx={{ width: 90, height: 90 }}>{name[0]}</Avatar>

						<div className='flex flex-row gap-10 items-center'>
							<div className='p-3 rounded-full bg-green-700 cursor-pointer text-white' onClick={answerCall}>
								<PhoneIcon />
							</div>
							<div className='p-3 rounded-full bg-red-700 cursor-pointer text-white' onClick={leaveCall}>
								<PhoneIcon />
							</div>
						</div>
					</div>
				}
				</>

				:
				<>
					{outgoingCall ?
						<>
							{callAccepted ?
								<InCallInterFace name={'A'} callAccepted={callAccepted} callEnded={callEnded} userVideo={userVideo} isSpeakerOn={isSpeakerOn} isMute={isMute} muteMic={muteMic} switchToSpeaker={switchAudioOutput} leaveCall={leaveCall} />

								: (
									<div className="flex min-h-screen flex-col items-center justify-between p-24">
										<div className='flex flex-col gap-4 items-center'>
											<p className='text-white font-bold text-xl'>Calling</p>
										</div>
										<Avatar sx={{ width: 90, height: 90 }}>A</Avatar>
										<div className="video">
											{stream && <audio playsInline ref={myVideo} muted autoPlay style={{ width: "300px" }} />}
										</div>
										<div className='flex flex-row gap-10 items-center'>
											<div className={`p-3 cursor-pointer rounded-full ${isSpeakerOn ? 'bg-blue-400' : 'bg-white'}`} onClick={() => { !isSpeakerOn ? switchAudioOutput('Speakers') : switchAudioOutput('Headphones') }}>
												<VolumeUpIcon />
											</div>
											<div className={`p-3 cursor-pointer rounded-full ${isMute ? 'bg-gray-400' : 'bg-white'}`} onClick={muteMic}>
												<VolumeOffIcon />
											</div>
											<div className='p-3 rounded-full bg-red-700 cursor-pointer text-white' onClick={leaveCall}>
												<PhoneIcon />
											</div>
										</div>
									</div>
								)}</>
						:
						<div className="flex min-h-screen flex-col items-center justify-center">
							< h1 style={{ textAlign: "center", color: '#fff', fontWeight: '800', marginBottom: 10, fontSize: '20px' }}>Audio call</h1 >
							<div className="container">
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
							</div>
						</div>
					}</>
			}
		</>
	)
}

export default App
