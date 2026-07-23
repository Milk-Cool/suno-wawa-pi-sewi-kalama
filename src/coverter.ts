import * as tokipona from "tokipona";

// can be customized in voicetext_ext_char_dict.msbt

// const pronouncuations = {
//     // white
//     "": "a",
//     "": "pi",
//     "": "ekese",
//     "": "wa",
//     "": "mute",
//     "": "lili",
//     "": "tomo",
//     "": "mute",
//     "": "lili",
//     "": "sitelen",
//     "": "ele",
//     "": "ale",
//     "": "ele anpa",
//     "": "ale anpa",
//     "": "ele",
//     "": "ale",
//     "": "sewi",
//     "": "anpa",
//     "": "open",
//     "": "pini",
//     "": "sewi",
//     "": "anpa",
//     "": "open",
//     "": "pini",

//     // black
//     "": "a",
//     "": "pi",
//     "": "ekese",
//     "": "wa",
//     "": "mute",
//     "": "lili",
//     "": "tomo",
//     "": "mute",
//     "": "lili",
//     "": "sitelen",
//     "": "ele",
//     "": "ale",
//     "": "ele anpa",
//     "": "ale anpa",
//     "": "ele",
//     "": "ale",
//     "": "sewi",
//     "": "anpa",
//     "": "open",
//     "": "pini",
//     "": "sewi",
//     "": "anpa",
//     "": "open",
//     "": "pini",

//     // joycon face buttons
//     "": "sewi",
//     "": "anpa",
//     "": "open",
//     "": "pini"
// };

function convertOne(latin: string) {
    const split = latin.split(/([\r\n\ue0a0-\ue152])/gu);
    return split.map(x => "\r\n".includes(x)
        ? x
        : x.codePointAt(0)! >= 0xe0a0 && x.codePointAt(0)! <= 0xe152
        ? x/* + pronouncuations[x as keyof typeof pronouncuations]*/
        : tokipona.convert(x, "latin", "sitelen-pona/ucsur").replace(/\u{f199c}$/gu, "")
        + (x.includes("<") ? x
        : x.replace(/(?<=(^|\s|\.|\?|!)[jklmnpstw])a/g, "á")
        .replace(/(?<=(^|\s|\.|\?|!)[jklmnpstw])i/g, "í")
        .replace(/(?<=(^|\s|\.|\?|!)[jklmnpstw])u/g, "ú")
        .replace(/(?<=(^|\s|\.|\?|!)[jklmnpstw])e/g, "é")
        .replace(/(?<=(^|\s|\.|\?|!)[jklmnpstw])o/g, "ó"))
        .replaceAll(" ", "(").replaceAll("j", "y").replaceAll(":",".").toLowerCase()).join("");
}
export default function convert(latin: string) {
    const split = latin.split(/(<Tag_\d+>)/g);
    return split.map(x => x.startsWith("<Tag_") ? x : convertOne(x)).join("");
}