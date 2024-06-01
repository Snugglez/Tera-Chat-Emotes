const path = require('path'), fs = require('fs')
exports.ClientMod = class {
    constructor(mod) {
        this.mod = mod
        this.hardInstall(mod)
    }
    //defines the directories needed and creates the mod directory in the client if not present
    hardInstall(mod) {
        const modDir = `${mod.clientInterface.info.path}/../S1Game/CookedPC/_snugmods`, tbModPath = path.join(__dirname, 'chatemotes.gpk')
        if (!fs.existsSync(modDir)) fs.mkdirSync(modDir)
        this.moveOver(path.join(modDir, 'chatemotes.gpk'), tbModPath)
    }
    //creates the symlink file linking the gpk in this mod to the mod folder in client
    moveOver(modPath, tbModPath) {
        try { fs.symlinkSync(tbModPath, modPath) } catch (err) {
            if (err.code == 'EEXIST') {//checks if the symlink file present is linked to the gpk in this current mod folder and replaces it if not
                if (fs.readlinkSync(modPath) == tbModPath) return
                else {
                    fs.unlinkSync(modPath)
                    this.moveOver(modPath, tbModPath)
                }
            }
        }
    }
}
exports.NetworkMod = function reee(d) {
    const settings = d.settings, command = d.command
    const emoteList = [
        ':alright:', ':blusher:', ':bread:', ':bshy:',
        ':catshy:', ':catthink:', ':clown:', ':cringe:',
        ':doggo:', ':ez:', ':fishing:', ':fishing2:',
        ':happyfly:', ':hugers:', ':hypers:', ':joy:',
        ':kekw:', ':kekwhands:', ':kms:', ':monkachrist:',
        ':monkas:', ':monkaw:', ':pantsgrab:', ':pausechamp:',
        ':peepounleash:', ':peepoweird:', ':pensive:', ':pensive2:',
        ':pepeclown:', ':pepecomfy:', ':pepega:', ':pepega2:',
        ':pepehands:', ':pepela:', ':pepelaugh:', ':pepelick:',
        ':pepesus:', ':pikasur:', ':poggers:', ':shrug:',
        ':shrug2:', ':skull:', ':slightsmile:', ':sob:',
        ':sus:', ':swblob:', ':thenk:', ':thisisfine:',
        ':thonk:', ':toast:', ':wtfbarry:', ':yep:',
        ':ban:', ':pepeban:', ':crycat:', ':feelsokman:',
        ':gotya:', ':heartcat:', ':pepecringe:', ':thumbsdown:',
        ':thumbsup:'
    ]

    d.hook('S_CHAT', '*', { filter: { fake: null } }, (e) => {
        if (!e.message.includes(':')) return //simple check so we arnt looping the emoteList for every message
        let found = false
        emoteList.forEach(emote => {
            if (e.message.includes(emote)) {
                found = true
                e.message = e.message.replaceAll(emote, `<img src="img://__chatemotes.${emote.split(':')[1]}" width="${settings.width}" height="${settings.height}" vspace="${settings.vspace}"/>`)
            }
        })
        if (!found) return
        d.send('S_DUNGEON_EVENT_MESSAGE', 2, {//reroutes the above message to this because sChat doesn't support the img tag directly
            type: -1,
            chat: true,
            channel: e.channel,
            message: `<FONT>${e.channel == 206 ? "" : `[${e.name}] : `}${e.message}</FONT>`
        })
        return false
    })

    const cmdMap = { 'w': 'width', 'h': 'height', 'v': 'vspace' }//shorthands, too lazy to move what the switchcase triggers to a function

    command.add('chatemotes', (arg, arg2) => {
        if (cmdMap[arg]) arg = cmdMap[arg]
        switch (arg) {
            case 'list': {
                let msg = "", ii = 0
                emoteList.forEach(emote => {
                    msg += `${emote}<img src="img://__chatemotes.${emote.split(':')[1]}" width="24" height="24" vspace="-8"/>${ii < 3 ? '|' : '&#10;'}`
                    ii++
                    if (ii > 3) ii = 0
                })
                d.send('S_DUNGEON_EVENT_MESSAGE', 2, {
                    type: -1,
                    chat: true,
                    channel: 18,
                    message: `<FONT>[emotelist]&#10;${msg}</FONT>`
                })
            } break
            case 'width':
            case 'height':
            case 'vspace': {
                settings[arg] = arg2 * 1
                command.message(`${arg} set to ${settings[arg]}`)
            } break
            case 'reset': {
                command.message(`reset size to default [width: 24 | height: 24 | vspace: -8]`)
                settings.width = 24; settings.height = 24; settings.vspace = -16
            } break
        }
    })

}
