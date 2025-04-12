// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import { DictionaryArray, Key, toNameMap } from "./SynthConfig"

function gcd(a: number, b: number): number {
    // If one of the numbers is 0, the other number is the GCD
    if (b === 0) return a;

    // Otherwise, recursively compute the GCD
    return gcd(b, a % b);
}

export function createKeys(edo: number): DictionaryArray<Key> {
    let bestFifth: number = Math.round(Math.log2(3/2)*edo);
    let fifthRatio: number = bestFifth/edo;
    let keys: Array<string> = Array(edo).fill("");
    let whiteKeyNames_5edo: Array<string> = ["C", "D", "F", "G", "A"];
    let keyNames_diatonicFifthward: Array<string> = ["C", "G", "D", "A", "E", "B", "F♯", "C♯", "G♯", "D♯", "A♯", "E♯", "B♯"];
    let keyNames_diatonicFourthward: Array<string> = ["C", "F", "B♭", "E♭", "A♭", "D♭", "G♭", "C♭", "F♭"];
    let keyNames_mavillaFifthward: Array<string> = ["C", "G", "D♭", "A♭", "E♭", "B♭", "F♭", "C♭"];
    let keyNames_mavillaFourthward: Array<string> = ["C", "F", "B", "E", "A", "D", "G♯", "C♯", "F♯", "B♯", "E♯", "A♯", "D♯"];
    let keyNames_oneiroSixthward: Array<string> = ["C", "H", "E♭", "B♭", "G♭", "D♭", "A♭", "F♭", "C♭", "H♭"];
    let keyNames_oneiroFourthward: Array<string> = ["C", "F", "A", "D", "G", "B", "E", "H♯", "C♯", "F♯", "A♯", "D♯", "G♯", "B♯", "E♯"];
    if (fifthRatio == 3/5) { // Fifth = 720 cents
        let fifthOctave: number = Math.round(edo/5);
        for ( let i = 0; i < 5; i++ ) {
            keys[i*fifthOctave] = whiteKeyNames_5edo[i]
            for ( let j = 1 ; j <= Math.ceil((fifthOctave-1)/2); j++ ) {
                keys[i*fifthOctave+j] = whiteKeyNames_5edo[i] + "+".repeat(j);
            }
            for ( let j = 1 ; j <= Math.floor((fifthOctave-1)/2); j++ ) {
                if (i == 0) {
                    keys[i*fifthOctave-j+edo] = whiteKeyNames_5edo[i] + "-".repeat(j);
                } else {
                    keys[i*fifthOctave-j] = whiteKeyNames_5edo[i] + "-".repeat(j);
                }
            }
        }
    } else if (fifthRatio == 2/3) { // Only possible in 6edo
        keys = ["C", "D", "E", "F", "A", "B"];
    } else if (fifthRatio >= 4/7 && fifthRatio < 3/5) { // Diatonic fifth (and 7edo equalized diatonic)
        let baseEdo: number = edo / gcd(edo, bestFifth);
        keys[0] = "C"
        for ( let i = 1; i <= 5 + Math.min(Math.ceil((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = (bestFifth * i) % edo;
            keys[thisPitch] = keyNames_diatonicFifthward[i];
        }
        for ( let i = 1; i <= 1 + Math.min(Math.floor((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = ((edo - bestFifth) * i) % edo;
            keys[thisPitch] = keyNames_diatonicFourthward[i];
        }

        let keysFinished: boolean = false;

        while (!keysFinished) {
            keysFinished = true;
            for ( let i = 0; i < edo; i++ ) {
                if (keys[i] == "") {
                    if (keys[i-1] != "") {
                        keys[i] = keys[i-1] + "+";
                    } else if (keys[i+1] != "") {
                        keys[i] = keys[i+1] + "-";
                    } else {
                        keysFinished = false;
                    }
                } else {
                    // do nothing
                }
            }
        }
    } else if (fifthRatio < 4/7) { // Mavilla fifth
        let baseEdo: number = edo / gcd(edo, bestFifth);
        keys[0] = "C"
        for ( let i = 1; i <= 5 + Math.min(Math.ceil((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = ((edo - bestFifth) * i) % edo;
            keys[thisPitch] = keyNames_mavillaFourthward[i];
        }
        for ( let i = 1; i <= 1 + Math.min(Math.floor((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = (bestFifth * i) % edo;
            keys[thisPitch] = keyNames_mavillaFifthward[i];
        }

        let keysFinished: boolean = false;

        while (!keysFinished) {
            keysFinished = true;
            for ( let i = 0; i < edo; i++ ) {
                if (keys[i] == "") {
                    if (keys[i-1] != "") {
                        keys[i] = keys[i-1] + "+";
                    } else if (keys[i+1] != "") {
                        keys[i] = keys[i+1] + "-";
                    } else {
                        keysFinished = false;
                    }
                } else {
                    // do nothing
                }
            }
        }
    } else if (fifthRatio > 3/5) { // Oneirotonic "fifth"- techically a sixth because it is the sixth degree of an eight-note scale
        let baseEdo: number = edo / gcd(edo, bestFifth);
        keys[0] = "C"
        for ( let i = 1; i <= 5 + Math.min(Math.ceil((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = ((edo - bestFifth) * i) % edo;
            keys[thisPitch] = keyNames_oneiroFourthward[i];
        }
        for ( let i = 1; i <= 1 + Math.min(Math.floor((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = (bestFifth * i) % edo;
            keys[thisPitch] = keyNames_oneiroSixthward[i];
        }

        let keysFinished: boolean = false;

        while (!keysFinished) {
            keysFinished = true;
            for ( let i = 0; i < edo; i++ ) {
                if (keys[i] == "") {
                    if (keys[i-1] != "") {
                        keys[i] = keys[i-1] + "+";
                    } else if (keys[i+1] != "") {
                        keys[i] = keys[i+1] + "-";
                    } else {
                        keysFinished = false;
                    }
                } else {
                    // do nothing
                }
            }
        }
    }
    let keyArray: Array<Key> = [];
    for ( let i = 0; i < edo; i++) {
        keyArray.push({ "index": i, "name": keys[i], "isWhiteKey": keys[i].length == 1 ? true : false, "basePitch": i + edo });
    }
    return toNameMap(keyArray);
}