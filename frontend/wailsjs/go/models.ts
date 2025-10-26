export namespace main {
	
	export class AudioData {
	    audioBase64: string;
	    mimeType: string;
	
	    static createFrom(source: any = {}) {
	        return new AudioData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.audioBase64 = source["audioBase64"];
	        this.mimeType = source["mimeType"];
	    }
	}
	export class ProcessAudioResponse {
	    transcription: string;
	    aiResponse: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new ProcessAudioResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.transcription = source["transcription"];
	        this.aiResponse = source["aiResponse"];
	        this.error = source["error"];
	    }
	}

}

