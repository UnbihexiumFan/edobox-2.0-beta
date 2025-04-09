// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import { SongDocument } from "./SongDocument";
import { Prompt } from "./Prompt";
import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ChangeSong } from "./changes";

	const {button, p, div, h2, input} = HTML;

export class ImportPrompt implements Prompt {
		private readonly _fileInput: HTMLInputElement = input({type: "file", accept: ".json,application/json,.mid,.midi,audio/midi,audio/x-midi"});
		private readonly _cancelButton: HTMLButtonElement = button({class: "cancelButton"});
		
		public readonly container: HTMLDivElement = div({class: "prompt noSelection", style: "width: 300px;"},
		h2("Import"),
			p({style: "text-align: left; margin: 0.5em 0;"},
			"BeepBox songs can be exported and re-imported as .json files. You could also use other means to make .json files for BeepBox as long as they follow the same structure.",
		),
			p({style: "text-align: left; margin: 0.5em 0;"},
			"BeepBox can also (crudely) import .mid files. There are many tools available for creating .mid files. Shorter and simpler songs are more likely to work well.",
		),
		this._fileInput,
		this._cancelButton,
	);
		
	constructor(private _doc: SongDocument) {
		this._fileInput.select();
			setTimeout(()=>this._fileInput.focus());
			
		this._fileInput.addEventListener("change", this._whenFileSelected);
		this._cancelButton.addEventListener("click", this._close);
	}
		
		private _close = (): void => { 
		this._doc.undo();
	}
		
		public cleanUp = (): void => { 
		this._fileInput.removeEventListener("change", this._whenFileSelected);
		this._cancelButton.removeEventListener("click", this._close);
	}
		
	private _whenFileSelected = (): void => {
		const file: File = this._fileInput.files![0];
		if (!file) return;
			
		const extension: string = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
		if (extension == "json") {
			const reader: FileReader = new FileReader();
			reader.addEventListener("load", (event: Event): void => {
				this._doc.prompt = null;
				this._doc.goBackToStart();
				this._doc.record(new ChangeSong(this._doc, <string>reader.result), true, true);
			});
			reader.readAsText(file);
		} else {
			console.error("Unrecognized file extension.");
			this._close();
		}
	}
}

