export namespace services {
	
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
	export class GetAIResponse {
	    aiResponse: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new GetAIResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.aiResponse = source["aiResponse"];
	        this.error = source["error"];
	    }
	}
	export class ScreenshotResponse {
	    imageBase64: string;
	    filepath: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new ScreenshotResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.imageBase64 = source["imageBase64"];
	        this.filepath = source["filepath"];
	        this.error = source["error"];
	    }
	}
	export class TranscribeAudioResponse {
	    transcription: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new TranscribeAudioResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.transcription = source["transcription"];
	        this.error = source["error"];
	    }
	}

}

