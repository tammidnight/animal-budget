const bear = document.querySelector("#bear");
const cow = document.querySelector("#cow");
const crocodile = document.querySelector("#crocodile");
const dog = document.querySelector("#dog");
const duck = document.querySelector("#duck");
const elephant = document.querySelector("#elephant");
const monkey = document.querySelector("#monkey");
const narwhale = document.querySelector("#narwhale");
const panda = document.querySelector("#panda");
const parrot = document.querySelector("#parrot");
const penguin = document.querySelector("#penguin");
const walrus = document.querySelector("#walrus");
const whale = document.querySelector("#whale");
const zebra = document.querySelector("#zebra");
const pig = document.querySelector("#pig");
const owl = document.querySelector("#owl");

const profilePic = document.querySelector("#mainPic");
const div = document.querySelector("#animalText");


window.addEventListener("load", () => {
    if (bear.checked) {
      bear.addEventListener('click', () => {
      div.innerHTML = '<h2>"Fun animal Fact"</h2><p>"Surprisingly black bears are not always black. We feel sort of cheated and we think that they should change their names, but we won’t be pushing the matter further as they’re extremely good climbers, fast runners and great swimmers, so they are able to hunt us down in every possible scenario."</p>'
      profilePic.innerHTML = '<div class="settingsPic"><img src="/images/bear.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
  })
    }
    if (cow.checked) {
        cow.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"Cows spend around 40% of the time eating, which is normal since they consume around 45kg of food per day. They’re also very sociable and they even have best friends, with whom we suppose they share some of that huge amount of food. Otherwise it would be just rude. "</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/cow.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (crocodile.checked) {
        crocodile.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"Crocodiles have the most sophisticated heart in the animal kingdom and they can choose the destination of the blood that flows throw it depending on what they need. They’re closely related to both dinosaurs and birds. It’s true, look it up If you don’t believe us."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/crocodile.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (dog.checked) {
        dog.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"Dogs can be left or right-pawed. You can fin out whether your dog is left or right-pawed by giving them their favourite toy and seeing which pay whey use first on it. Scientists believe dogs can experience jealousy when their owners give attention to other dogs. But if they look ashamed but they’re lying since they don’t experience that emotion. Liars."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/dog.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (duck.checked) {
        duck.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"Ducks, so many ducks. There are more than 120 species of ducks. Most of them have waterproof feathers thanks to an intricate feather structure and a wax-like coating of every feather. They’re so waterproof that even when the duck dives underwater its downy underlayer of feathers stays completely dry. Their feet have no blood vessels nor nerves, meaning  that their feet do not feel the cold."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/duck.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (elephant.checked) {
        elephant.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"You can tell the species of an elephant thanks to it’s ears. Because their tusks never stop growing they’re an indication of age. They’re very into skincare and they love sunscreen so much they made their own. After a river or swamp bath, they’ll throw mud and sand up and over themselves to protect their skin from the hot, burning sun. Clever"</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/elephant.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (monkey.checked) {
        monkey.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"Some monkeys enjoy a relaxing hot bath, so the link between humans are monkeys is clear and irrefutable. There are a lot of different species, and they are very different between them. Some monkeys live on the ground, while others live in trees. Different monkey species eat a varietyof foods, such as fruit, insects, flowers, leaves and reptiles. Groups of monkeys are known as a tribe, troop or mission."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/monkey.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (narwhale.checked) {
        narwhale.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"Narwhals are Canadian, 75% of them live in the Canadian artic for up to 50 years. They change colour with age, they’re specked blue-grey when born, blue-black as teens, specked grey as adults and old narwhals are almost all white. Generally speaking only male narwhals have a tusk. "</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/narwhale.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (owl.checked) {
        owl.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"A group of owls is called a parliament. This originates from C.S. Lewis’ description of a meeting of owls in The Chronicles of Narnia. Owls can rotate their necks 270 degrees, which makes them insanely good hunters. They’re actually a bit too good for their own good, as owns hunt other owls."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/owl.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (panda.checked) {
        panda.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"Giant pandas spend 10-16 hours a day feeding, mainly on bamboo. That’s why their throat has a special lining to protect it from  splinters. However bamboo doesn’t provide them with enough calories to accumulate fat and they don’t hibernate. That’s also the reason they don’t  usually compete with one another and they’re loners, they do not have the energy (or are they just lazy?)."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/panda.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (parrot.checked) {
        parrot.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>" Parrots are incredible romantic and once they mate they generally stay together even outside of the breeding season. It’s specially notable since they’re the only birds that eat with their feet. They can learn pretty much any sound if they don’t repeat one it’s because they don’t want to."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/parrot.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (penguin.checked) {
        penguin.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"A Penguin’s black and white plumage serves as camouflage while swimming. The black plumage on their back is hard to see from above, whilethe white plumage on their front looks like the sun reflecting off the surface  of the water when seen from below. Also, they have very fast metabolisms, so they poop every 20 min!"</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/penguin.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (pig.checked) {
        pig.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"Pigs are smarter than dogs (and probably some humans) and they can’t sweat. Mother pigs like to sing to their piglets while their nurse so they will recognize it later and will come when they yell at them because they forgot to make their bed in the morning we presume. Pigs have more than 20 distinct grunts to communicate everything: from hunger to calling for mates"</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/pig.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (walrus.checked) {
        walrus.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"  Walrus are called the kings of the artic due to the fact that they can weight up to 1.5 tones, the weight of a small car!  They’re very social animals and the mostly use their tusks to for cutting through ice and getting out of the water, although they will use them against one another for protection or during mating season."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/walrus.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (whale.checked) {
        whale.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"The whale is the largest animal to ever live, they can weight more than 150,000 kg, and they’re also one oldest (they can live around 200 years). They’re very social and sing to find food, communicating with one another or to find each other when they separate."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/whale.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
    if (zebra.checked) {
        zebra.addEventListener('click', () => {
        div.innerHTML = '<h1>"Fun animal Fact"</h1><p>"Their stripes are as unique are humans’ fingerprints, and they serve as camouflage. They can stand six minutes after being born, walk 40 minutes after and are able to run an hour after birth. It totally puts us  humans to shame."</p>'
        profilePic.innerHTML = '<div class="settingsPic"><img src="/images/zebra.png" class="figure-img img-fluid rounded" alt="The users profile pic"><figcaption class="figure-caption">Click on the animals to change me! </figcaption></figure></div>'
    })
      }
  });

