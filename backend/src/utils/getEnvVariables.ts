export interface Env {
  API_HOST: string;
}


export function getKey(){
    const key = process.env.JWT_ACCESS_SECRET 
return console.log(key)
}