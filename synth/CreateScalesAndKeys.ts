// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import { DictionaryArray, Key, toNameMap, Scale } from "./SynthConfig"

function gcd(a: number, b: number): number {
    // If one of the numbers is 0, the other number is the GCD
    if (b === 0) return a;

    // Otherwise, recursively compute the GCD
    return gcd(b, a % b);
}

function finishKeys(keys: Array<string>, edo: number): Array<string> {
    let keysFinished: boolean = false;
    
    let newKeys: Array<string>;
    while (!keysFinished) {
        keysFinished = true;
        newKeys = structuredClone(keys);
        for ( let i = 0; i < edo; i++ ) {
            if (keys[i] == "") {
                if (keys[i-1] != "") {
                    newKeys[i] = keys[i-1] + "+";
                } else if (keys[(i+1)%edo] != "") {
                    newKeys[i] = keys[(i+1)%edo] + "-";
                } else {
                    keysFinished = false;
                }
            } else {
                // do nothing
            }
        }
        keys = structuredClone(newKeys);
    }

    return keys;
}

function createMOS(edo: number, gen: number, modeNames: Array<string>, scaleArray: Array<Scale>, numGens: number, scaleName: string, realScaleName: string): Array<Scale> {
    for (let gensDown=0; gensDown<numGens; gensDown++) {
        let thisFlags: Array<boolean> = Array(edo).fill(false);
        thisFlags[0] = true;
        let gensUp: number = numGens - gensDown - 1;
        for (let i = 1; i <= gensUp; i++) {
            thisFlags[(gen * i) % edo] = true;
        }
        for (let i = 1; i <= gensDown; i++) {
            thisFlags[((edo-gen) * i) % edo] = true;
        }
        scaleArray.push({ "index": scaleArray.length, "name": modeNames[gensDown]+" "+scaleName, "realName": realScaleName+" "+gensUp+"|"+gensDown, "flags": thisFlags});
    }
    return scaleArray;
}

export function createKeys(edo: number): DictionaryArray<Key> {
    let bestFifth: number = Math.round(Math.log2(3/2)*edo);
    let fifthRatio: number = bestFifth/edo;
    let keys: Array<string> = Array(edo).fill("");
    let keyNames_5edo: Array<string> = ["C", "D", "F", "G", "A"];
    let keyNames_diatonicFifthward: Array<string> = ["C", "G", "D", "A", "E", "B", "F♯", "C♯", "G♯", "D♯", "A♯", "E♯", "B♯"];
    let keyNames_diatonicFourthward: Array<string> = ["C", "F", "B♭", "E♭", "A♭", "D♭", "G♭", "C♭", "F♭"];
    let keyNames_mavilaFifthward: Array<string> = ["C", "G", "D♭", "A♭", "E♭", "B♭", "F♭", "C♭", "G♭"];
    let keyNames_mavilaFourthward: Array<string> = ["C", "F", "B", "E", "A", "D", "G♯", "C♯", "F♯", "B♯", "E♯", "A♯", "D♯"];
    let keyNames_oneiroSixthward: Array<string> = ["C", "H", "E♭", "B♭", "G♭", "D♭", "A♭", "F♭", "C♭", "H♭"];
    let keyNames_oneiroFourthward: Array<string> = ["C", "F", "A", "D", "G", "B", "E", "H♯", "C♯", "F♯", "A♯", "D♯", "G♯", "B♯", "E♯"];
    if (fifthRatio == 3/5) { // Fifth = 720 cents
        let fifthOctave: number = Math.round(edo/5);
        for ( let i = 0; i < 5; i++ ) {
            keys[i*fifthOctave] = keyNames_5edo[i]
        }

        keys = finishKeys(keys, edo);
    } else if (edo == 6) { // 6edo has no fifth
        keys = ["C", "D", "E", "F", "A", "B"];
    } else if (edo == 11) { // 11edo's fifth is kinda weird, orgone-based note names instead
        keys = ["C", "C♯", "D", "E", "E♯", "F", "F♯", "G", "A", "A♯", "B"];
    } else if (fifthRatio >= 4/7 && fifthRatio < 3/5) { // Diatonic fifth (and 7edo equalized diatonic)
        let baseEdo: number = edo / gcd(edo, bestFifth);
        keys[0] = "C"
        for ( let i = 1; i <= 5 + Math.min(Math.ceil((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = (bestFifth * i) % edo;
            if (keyNames_diatonicFifthward[i] != "B♯" && keyNames_diatonicFifthward[i] != "E♯") {keys[thisPitch] = keyNames_diatonicFifthward[i]}; // B♯ and E♯ are cringe
        }
        for ( let i = 1; i <= 1 + Math.min(Math.floor((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = ((edo - bestFifth) * i) % edo;
            keys[thisPitch] = keyNames_diatonicFourthward[i];
        }

        keys = finishKeys(keys, edo);
    } else if (fifthRatio < 4/7) { // Mavila fifth
        let baseEdo: number = edo / gcd(edo, bestFifth);
        keys[0] = "C"
        for ( let i = 1; i <= 5 + Math.min(Math.ceil((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = ((edo - bestFifth) * i) % edo;
            keys[thisPitch] = keyNames_mavilaFourthward[i];
        }
        for ( let i = 1; i <= 1 + Math.min(Math.floor((baseEdo-7)/2), 7); i++ ) {
            let thisPitch: number = (bestFifth * i) % edo;
            keys[thisPitch] = keyNames_mavilaFifthward[i];
        }

        keys = finishKeys(keys, edo);
    } else if (fifthRatio > 3/5) { // Oneirotonic "fifth"- techically a sixth because it is the sixth degree of an eight-note scale
        let baseEdo: number = edo / gcd(edo, bestFifth);
        keys[0] = "C"
        for ( let i = 1; i <= 6 + Math.min(Math.ceil((baseEdo-8)/2), 8); i++ ) {
            let thisPitch: number = ((edo - bestFifth) * i) % edo;
            keys[thisPitch] = keyNames_oneiroFourthward[i];
        }
        for ( let i = 1; i <= 1 + Math.min(Math.floor((baseEdo-8)/2), 8); i++ ) {
            let thisPitch: number = (bestFifth * i) % edo;
            keys[thisPitch] = keyNames_oneiroSixthward[i];
        }

        keys = finishKeys(keys, edo);
    }
    let keyArray: Array<Key> = [];
    for ( let i = 0; i < edo; i++) {
        keyArray.push({ "index": i, "name": keys[i], "isWhiteKey": keys[i].length == 1 ? true : false, "basePitch": i + edo });
    }
    return toNameMap(keyArray);
}

export function createScales(edo: number): DictionaryArray<Scale> {
    let scaleArray: Array<Scale> = [];
    let scaleName: string;
    let realScaleName: string;
    let modeNames: Array<string>;
    scaleArray.push({ "index": 0, "name": "Free", "realName": edo.toString()+"edo", "flags": Array(edo).fill(true) });

    let bestGen: number = Math.round(Math.log2(3/2)*edo); // diatonic
    let ratioGen: number = bestGen/edo;
    if (ratioGen >= 4/7 && ratioGen < 3/5) {
        realScaleName = "pentic";
        modeNames = ["Major (Ionian)", "Mixolydian", "Dorian", "Minor (Aeolian)", "Phrygian"];
        if (ratioGen < Math.log2(3/2)) {
            scaleName = "Meantone Pentatonic";
        } else {
            scaleName = "Superpyth Pentatonic";
        }
        scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 5, scaleName, realScaleName);
        if (!(ratioGen == 4/7)) {
            realScaleName = "diatonic";
            modeNames = ["Lydian", "Major (Ionian)", "Mixolydian", "Dorian", "Minor (Aeolian)", "Phrygian", "Locrian"];
            if (ratioGen < Math.log2(3/2)) {
                scaleName = "Meantone Heptatonic";
            } else {
                scaleName = "Superpyth Heptatonic";
            }
            scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 7, scaleName, realScaleName);
        }
    }

    bestGen = Math.round(Math.log2(11/8)*edo); // mavila/antidiatonic
    ratioGen = bestGen/edo;
    if (ratioGen <= 4/9 && ratioGen > 3/7) { // balzano fifths make weird scales so I'm not including them
        realScaleName = "pentic";
        modeNames = ["Major (Ionian)", "Mixolydian", "Dorian", "Minor (Aeolian)", "Phrygian"];
        scaleName = "Mavila Pentatonic";
        scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 5, scaleName, realScaleName);
        realScaleName = "antidiatonic";
        modeNames = ["Lydian", "Major (Ionian)", "Mixolydian", "Dorian", "Minor (Aeolian)", "Phrygian", "Locrian"];
        scaleName = "Mavila Heptatonic";
        scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 7, scaleName, realScaleName);
    }

    bestGen = Math.round(Math.log2(14/9)*edo); // checkertonic
    ratioGen = bestGen/edo;
    if (ratioGen < 2/3 && ratioGen >= 5/8) {
        realScaleName = "antipentic";
        modeNames = ["Major", "Dark Major", "Neutral", "Minor", "Dark"];
        if (ratioGen > Math.log2(14/9)) {
            scaleName = "Squares Pentatonic";
        } else {
            scaleName = "Sensi Pentatonic";
        }
        scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 5, scaleName, realScaleName);
        if (!(ratioGen == 5/8)) {
            realScaleName = "checkertonic";
            modeNames = ["Bright", "Major", "Dark Major", "Bright Neutral", "Dark Neutral", "Minor", "Dark", "Diminished"];
            if (ratioGen > Math.log2(14/9)) {
                scaleName = "Squares Octatonic";
            } else {
                scaleName = "Sensi Octatonic";
            }
            scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 8, scaleName, realScaleName);
        }
    }

    bestGen = Math.round(Math.log2(Math.cbrt(20/9))*edo); // oneirotonic
    ratioGen = bestGen/edo;
    if (ratioGen < 2/5 && ratioGen > 3/8) {
        realScaleName = "antipentic";
        modeNames = ["Major", "Dark Major", "Neutral", "Minor", "Dark"];
        if (ratioGen > Math.log2(Math.cbrt(20/9))) {
            scaleName = "A-Team Pentatonic";
        } else {
            scaleName = "Petrtri Pentatonic";
        }
        scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 5, scaleName, realScaleName);
        realScaleName = "oneirotonic";
        modeNames = ["Bright", "Major", "Dark Major", "Bright Neutral", "Dark Neutral", "Minor", "Dark", "Diminished"];
        if (ratioGen > Math.log2(Math.cbrt(20/9))) {
            scaleName = "A-Team Octatonic";
        } else {
            scaleName = "Petrtri Octatonic";
        }
        scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 8, scaleName, realScaleName);
    }

    bestGen = Math.round(Math.log2(Math.sqrt(3/2))*edo); // mosh
    ratioGen = bestGen/edo;
    if (ratioGen < 1/3 && ratioGen > 2/7) {
        realScaleName = "mosh";
        modeNames = ["Bright", "Major", "Dark Major", "Neutral", "Minor", "Dark", "Diminished"];
        scaleName = "Mohajira Heptatonic";
        scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 7, scaleName, realScaleName);
    }

    bestGen = Math.round(Math.log2(128/77)*edo); // smitonic
    ratioGen = bestGen/edo;
    if (ratioGen < 3/4 && ratioGen > 5/7) {
        realScaleName = "smitonic";
        modeNames = ["Bright", "Major", "Dark Major", "Neutral", "Minor", "Dark", "Diminished"];
        if (ratioGen > Math.log2(128/77)) {
            scaleName = "Kleismic Heptatonic";
        } else {
            scaleName = "Orgone Heptatonic";
        }
        scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 7, scaleName, realScaleName);
    }

    bestGen = Math.round(Math.log2(7/6)*edo); // manual
    ratioGen = bestGen/edo;
    if (ratioGen < 3/4 && ratioGen > 5/7) {
        realScaleName = "smitonic";
        modeNames = ["Major", "Dark Major", "Neutral", "Minor", "Dark"];
        if (ratioGen > Math.log2(7/6)) {
            scaleName = "Orwell Heptatonic";
        } else {
            scaleName = "Semaphore Heptatonic";
        }
        scaleArray = createMOS(edo, bestGen, modeNames, scaleArray, 5, scaleName, realScaleName);
    }

    return toNameMap(scaleArray);
}