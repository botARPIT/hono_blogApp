function hexToBytes(hex: string): Uint8Array | null{
   if(hex.length % 2 !== 0) throw new Error("Invalid hex string")

    //Converting hex to bytes
    const bytes = []
    for(let i = 0; i < hex.length; i += 2){
        const byte = parseInt(hex.substring(i, i + 2), 16)
        if(isNaN(byte)){
            return null
        }
        bytes.push(byte)
    }
    return new Uint8Array(bytes)
}

export {hexToBytes}