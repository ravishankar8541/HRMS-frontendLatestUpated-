import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getServerBase } from '../utils/serverBase';
export default function PrivateImage({src,...props}) {
 const [loaded,setLoaded]=useState(null);
 const needsAuth=typeof src==='string' && src.startsWith(getServerBase()+'/uploads/');
 useEffect(()=>{
  if(!needsAuth)return;
  let cancelled=false, url;
  api.get(src,{responseType:'blob'}).then(response=>{if(!cancelled){url=URL.createObjectURL(response.data);setLoaded({src,url});}}).catch(()=>{});
  return ()=>{cancelled=true;if(url)URL.revokeObjectURL(url);};
 },[src,needsAuth]);
 return <img {...props} src={needsAuth ? (loaded?.src===src?loaded.url:undefined) : src} loading="lazy"/>;
}
