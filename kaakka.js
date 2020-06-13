const puppeteer = require('puppeteer')
const argv = require('yargs').argv
const config = require('./config.js')
const logSymbols = require('log-symbols');

let trollMe = async (user, detectFace = false) => {

    var isnum = /^\d+$/.test(user);

    const browser = await puppeteer.launch({headless:false})
    const page = await browser.newPage();
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://m.facebook.com",  ["notifications"]);

    await page.goto('https://m.facebook.com/login/', { waitUntil:'networkidle2' });

    const email = await page.waitForSelector('#m_login_email')
    const password = await page.waitForSelector('#m_login_password')

    await email.type(config.data.login.email)
    await password.type(config.data.login.password)
    
    setTimeout(() => {
        page.click('#u_0_4')
    }, 500)
    
    console.log("Loging in to the facebook account ...")
    await page.waitForNavigation();
    console.log("Login Success !")
    if(!isnum) {
        var profilePicsUrl = 'https://m.facebook.com/'+user+'/photos'
    } else {
        var profilePicsUrl = 'https://m.facebook.com/profile.php?v=photos&id='+user
    }

    await page.goto(profilePicsUrl, { waitUntil: "networkidle2" })
    
    // Getting Profile data

    let proData = await page.evaluate(() => {

        var proAlbumUrl = '';
        
        let elements = document.getElementsByClassName('touchable primary');
        let proName = document.getElementsByClassName("_6j_c")[0].innerText

        for (var element of elements)
            if(element.innerText.includes('Profile Pictures')) {
                var proAlbumUrl = element.href;
            }
                
        return { name: proName, url: proAlbumUrl };
    });

    // Visiting profile user's picture section

    console.log("Getting all "+proData.name.split(" ")[0]+"'s old profile pictures...")
    await page.goto(proData.url, { waitUntil:"networkidle2" })
    await page.waitForSelector('div._8brv')

    // Getting all profile pictures

    var items = await page.evaluate(extractItems);
    var items = last(items, items.length / 2);
    var filterdItems = []

    if(detectFace) {

        // Init face-api

        const faceapi = require('face-api.js')
        const canvas = require("canvas");
        const { Canvas, Image, ImageData } = canvas;

        faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
        await faceapi.nets.tinyFaceDetector.loadFromDisk('./models')

        console.clear()
        showHeader()

        console.log("["+proData.name.split(" ")[0]+"] Detecting faces of "+items.length+" images. please wait ...\n")

        var i = 0

        for(let item of items) {

            i++
            let urlParams = new URLSearchParams(item.href)
            const img = await canvas.loadImage(item.src);
            const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            
            if(detection) {
                console.log("IMAGE ["+i+"/"+items.length+"] => "+item.href.split("=")[1].split("&")[0]+" "+logSymbols.success)
                filterdItems.push(item)
            } else {
                console.log("IMAGE ["+i+"/"+items.length+"] => "+item.href.split("=")[1].split("&")[0]+" "+logSymbols.error)
            }
        }

        

        if(filterdItems.length > 0) {
            console.log("\n["+proData.name.split(" ")[0]+"] Done detecting faces of "+filterdItems.length+"/"+items.length+"\n")
            addComments(page, filterdItems)
        } else {
            console.log("No faces detected in photos. Try again with face-detection mode disabled.")
            process.exit()
        }
        
        

    } else {
        
        addComments(page, items)
        
    }
    
};

var last =  function(array, n) {
    if (array == null) 
      return void 0;
    if (n == null) 
       return array[array.length - 1];
    return array.slice(Math.max(array.length - n, 0));  
};

let addComments = async(page, items) => {
    
    console.log("Total Comentable photos: ", items.length +"\n")
    console.log("Adding comments, please wait ...\n")

    var i = 0

    for(var post of items) {
        
        let comment = config.data.comments[Math.floor(Math.random() * config.data.comments.length)];
        
        i++
        // Visiting post link 
        await page.goto(post.href, {waitUntil: "networkidle2"})

        // Typing comment
        await page.waitForSelector('#composerInput')
        await page.focus('#composerInput')
        await page.keyboard.type(comment)

        //Submiting the comment
        await page.waitForSelector('button[type="submit"]._54k8._52jg._56bs._26vk._3lmf._3fyi._56bv._653w')
        await page.$$eval('button[type="submit"]._54k8._52jg._56bs._26vk._3lmf._3fyi._56bv._653w', elements => elements[0].click());
        console.log("IMAGE ["+i+"/"+items.length+"] Commenting => "+post.href+" "+logSymbols.success)
    }

    console.log("\n"+logSymbols.success, "Done adding comments :)")
    process.exit()
}

function extractItems() {
    const extractedElements = document.querySelectorAll('._8brv');
    const items = [];
    for (let element of extractedElements) {
      
      let data = {href: element.children[0].href, src: element.children[0].children[0].src}
      items.push(data);

    }

    return items;
}

function start() {

        let errors = erorrCheck()

        if(errors.length > 0) {
            showHeader()
            showHelp(errors)
        } else {
            showHeader()
            trollMe(argv.victim, argv.fd)
        }

}

function showHeader() {
    console.log("\n  █████▒▄▄▄▄       ██ ▄█▀▄▄▄      ▄▄▄       ██ ▄█▀ ██ ▄█▀▄▄▄    `:+ydh+`")
    console.log("▓██   ▒▓█████▄     ██▄█▒▒████▄   ▒████▄     ██▄█▒  ██▄█▒▒████▄    `..sMMMy`")
    console.log("▒████ ░▒██▒ ▄██   ▓███▄░▒██  ▀█▄ ▒██  ▀█▄  ▓███▄░ ▓███▄░▒██  ▀█▄     `MMMMd+.`")
    console.log("░▓█▒  ░▒██░█▀     ▓██ █▄░██▄▄▄▄██░██▄▄▄▄██ ▓██ █▄ ▓██ █▄░██▄▄▄▄██     dMMMMMNh+-`")
    console.log("░▒█░   ░▓█  ▀█▓   ▒██▒ █▄▓█   ▓██▒▓█   ▓██▒▒██▒ █▄▒██▒ █▄▓█   ▓██▒    .ymMMMMMMNh:")
    console.log(" ▒ ░   ░▒▓███▀▒   ▒ ▒▒ ▓▒▒▒   ▓▒█░▒▒   ▓▒█░▒ ▒▒ ▓▒▒ ▒▒ ▓▒▒▒   ▓▒█░     `./dMhooydmy/.")
    console.log(" ░     ▒░▒   ░    ░ ░▒ ▒░ ▒   ▒▒ ░ ▒   ▒▒ ░░ ░▒ ▒░░ ░▒ ▒░ ▒   ▒▒ ░        os`   `.:oo`")
    console.log("        ░         ░  ░        ░  ░     ░  ░░  ░   ░  ░        ░  ░     `:+s-        ``  by MaNa :}\n")
}

function showHelp(errors) {
   
    if(errors.length > 0) {
        console.log("Errors:\n")
        for(let error of errors) {
            console.log("  "+logSymbols.warning+" "+error)
        }

    }

    console.log("\nOptions:\n")
    console.log("  --victim=[id|username]*     Victim's facebook profile id or username.")
    console.log("  --fd=[true|false]         enable/disable face-detection on photos. deafult is disabled.")

    process.exit()

}

function erorrCheck() {
    var errors = []

    // Error chekcing 
    if(!config.data.login.email || !config.data.login.password) {
        errors.push("Email or password is not provided. Please add them in the config.js file")
    }
    if(!argv.victim) {
        errors.push("Victim's profile id/username is not provided.")
    }
    
    if(config.data.comments.length === 0) {
        errors.push("Comments are empty. Please provide them in config.js file.")
    }

    return errors
}

start()



