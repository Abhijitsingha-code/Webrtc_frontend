import React from 'react'
import Avatar from '@mui/material/Avatar';
import CallControls from './callControl';

interface prop {
	isSpeakerOn: boolean;
	isMute: boolean;
	muteMic: any;
	switchToSpeaker: any;
	leaveCall: any;
	name: string;
	callAccepted: boolean;
	callEnded: boolean;
	userVideo: any;
}


const InCallInterFace = ({ name, callAccepted, callEnded, userVideo, isSpeakerOn, isMute, muteMic, switchToSpeaker, leaveCall }: prop) => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className='flex flex-col gap-4 items-center'>
				<p className='text-white font-bold text-xl'>In Call</p>
			</div>
			<Avatar sx={{ width: 90, height: 90 }}>{name[0]}</Avatar>
			<div className="video-container">
				{/* <div className="video"> */}
				{/* <p>Desktop :</p> */}
				{/* {stream && <audio playsInline ref={myVideo} muted autoPlay style={{ width: "300px" }} />} */}
				{/* </div> */}
				<div className="video">
					{/* {name ? <p>{name} :</p>: null} */}
					{/* <p>Remote :</p> */}
					{callAccepted && !callEnded ?
						<audio playsInline ref={userVideo} autoPlay style={{ width: "300px" }} /> :
						null}
				</div>
			</div>
			<CallControls isMute={isMute} isSpeakerOn={isSpeakerOn} muteMic={muteMic} leaveCall={leaveCall} switchToSpeaker={switchToSpeaker} />
		</div>
	);
};

export default InCallInterFace;