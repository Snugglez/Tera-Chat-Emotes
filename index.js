exports.ClientMod = class {
    install(installer) {
        installer.gpk("chatemotes.gpk")
    }
}
exports.NetworkMod = function reee(d) {
    const emoteList = [
        ':alright:', ':blusher:', ':bread:',
        ':bshy:', ':catshy:', ':catthink:',
        ':clown:', ':cringe:', ':doggo:',
        ':ez:', ':fishing:', ':fishing2:',
        ':happyfly:', ':hugers:', ':hypers:',
        ':joy:', ':kekw:', ':kekwhands:',
        ':kms:', ':monkachrist:', ':monkas:',
        ':monkaw:', ':pantsgrab:', ':pausechamp:',
        ':peepounleash:', ':peepoweird:', ':pensive:',
        ':pensive2:', ':pepeclown:', ':pepecomfy:',
        ':pepega:', ':pepega2:', ':pepehands:',
        ':pepela:', ':pepelaugh:', ':pepelick:',
        ':pepesus:', ':pikasur:', ':poggers:',
        ':shrug:', ':shrug2:', ':skull:',
        ':slightsmile:', ':sob:', ':sus:',
        ':swblob:', ':thenk:', ':thisisfine:',
        ':thonk:', ':toast:', ':wtfbarry:',
        ':yep:'
    ]

    d.hook('S_CHAT', '*', { filter: { fake: null } }, (e) => {
        let found = false
        emoteList.forEach(emote => {
            if (e.message.includes(emote)) {
                found = true
                e.message = e.message.replaceAll(emote, `<img src="img://__chatemotes.${emote.split(':')[1]}" width="${d.settings.width}" height="${d.settings.height}" vspace="${d.settings.vspace}"/>`)
            }
        })
        if (!found) return
        d.send('S_DUNGEON_EVENT_MESSAGE', 2, {
            type: -1,
            chat: true,
            channel: e.channel,
            message: `<FONT>${e.channel == 206 ? "" : `[${e.name}] : `}${e.message}</FONT>`
        })
        return false
    })

    d.command.add('chatemotes', (arg, arg2) => {
        switch (arg) {
            case 'list': {
                let msg = "", ii = 0
                emoteList.forEach(emote => {
                    msg += `${emote} <img src="img://__chatemotes.${emote.split(':')[1]}" width="24" height="24" vspace="-8"/>${ii < 2 ? ' | ' : '&#10;'}`
                    ii++
                    if (ii > 2) ii = 0
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
                d.command.message(`${arg} set to ${arg2}`)
                d.settings[arg] = arg2 * 1
            } break
            case 'reset': {
                d.command.message(`reset size to default [width: 24 | height: 24 | vspace: -8]`)
                d.settings.width = 24; d.settings.height = 24; d.settings.vspace = -8
            } break
        }
    })

}
