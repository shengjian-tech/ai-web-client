export function saveCusConfig(falg:string,data:any){

    chrome.runtime.sendMessage({type:falg,data:JSON.stringify(data)},(resp)=>{
        console.log("content的回复:", resp);
    })

}