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
        ':thumbsup:', ':eyes:', ':tm:'
    ]

    function replacer(arg) {
        if (!arg.includes(':')) return //simple check so we arnt looping the emoteList for every message
        let found = false
        emoteList.forEach(emote => {
            if (arg.includes(emote)) {
                found = true
                arg = arg.replaceAll(emote, `<img src="img://__chatemotes.${emote.split(':')[1]}" width="${settings.width}" height="${settings.height}" vspace="${settings.vspace}"/>`)
            }
        })
        if (!found) return false
        else return arg
    }

    //fun jank workaround to get these working in whispers
    d.dispatch.addDefinition('S_REPLY_CLIENT_CHAT_OPTION_SETTING', 0, __dirname + '//S_REPLY_CLIENT_CHAT_OPTION_SETTING.def', true)

    d.hook('S_WHISPER', '*', (e) => {
        if (!e.message.includes(':')) return //simple check so we arnt looping the emoteList for every message
        e.message = replacer(e.message)
        if (!e.message) return
        const fromMe = d.game.me.is(e.gameId)
        d.send('S_DUNGEON_EVENT_MESSAGE', 2, {
            type: -1,
            chat: true,
            channel: 206,
            message: `<FONT>${fromMe ? '[Sent Whisper' : '   <img src="img://__chatemotes.whisperArrow" width="18" height="18" vspace="-4"/>[Received Whisper'}][${e.name}] : ${e.message}</FONT>`
        })
        d.send('S_PLAY_SOUND_BYNAME', '*', {
            gameId: d.game.me.gameId,
            volume: 1,
            range: 1,
            pitch: 1,
            name: 'InterfaceSound.SYSMSGCUE.SYSMSG_2001Cue'
        })
        return false
    })

    d.hook('S_REPLY_CLIENT_CHAT_OPTION_SETTING', 0, { filter: { fake: null } }, (e) => {
        e.tabs.forEach(tab => {
            if (tab.channels.includes(7) && !tab.channels.includes(206)) tab.channels.push(206)
        })
        if (!e.channels.find(channel => channel.id == 206)) {
            const whispChan = e.channels.find(channel => channel.id == 7)
            if (whispChan) e.channels.push({ id: 206, r: whispChan.r, g: whispChan.g, b: whispChan.b })
            else e.channels.push({ id: 206, r: 238, g: 153, b: 255 })
        }
        return true
    })

    d.hook('S_CHAT', '*', { filter: { fake: null } }, (e) => {
        if (!e.message.includes(':')) return //simple check so we arnt looping the emoteList for every message
        e.message = replacer(e.message)
        if (!e.message) return
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
