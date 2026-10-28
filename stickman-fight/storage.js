export function load(){try{return JSON.parse(localStorage.getItem('stickman-showdown'))||{};}catch{return {};}}
export function save(data){try{localStorage.setItem('stickman-showdown',JSON.stringify(data));}catch{}}
