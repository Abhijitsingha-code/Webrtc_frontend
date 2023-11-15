"use client"

import React from 'react';
import PhoneIcon from '@mui/icons-material/Phone';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface prop {
    isSpeakerOn: boolean;
    isMute: boolean;
    muteMic:any;
    switchToSpeaker:any;
    leaveCall:any;
}

const CallControls = ({ isSpeakerOn, isMute, muteMic, switchToSpeaker, leaveCall }:prop) => {
    return (
        <div className='flex flex-row gap-10 items-center'>
            <div className={`p-3 cursor-pointer rounded-full ${isSpeakerOn ? 'bg-blue-400' : 'bg-white'}`} onClick={()=>{!isSpeakerOn ? switchToSpeaker('Speakers') :  switchToSpeaker('Headphones')}}>
                <VolumeUpIcon />
            </div>
            <div className={`p-3 cursor-pointer rounded-full ${isMute ? 'bg-gray-400' : 'bg-white'}`} onClick={muteMic}>
                <VolumeOffIcon />
            </div>
            <div className='p-3 rounded-full bg-red-700 cursor-pointer text-white' onClick={leaveCall}>
                <PhoneIcon />
            </div>
        </div>
    );
};

export default CallControls;