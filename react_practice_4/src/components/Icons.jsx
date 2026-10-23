import {Stethoscope,ShieldCheck,Smile,Scissors,HeartPulse,Activity} from 'lucide-react';
const map={stethoscope:Stethoscope,shield:ShieldCheck,smile:Smile,scissors:Scissors,heart:HeartPulse,activity:Activity};
export default function ServiceIcon({name,size=24}){const Icon=map[name]||Stethoscope;return <Icon size={size}/>}
