class DLGUpsellTree extends SrDUpsellTree {
    defaults() {
        return {
            "injection_point":".srd-upsell-tree",
        }
    }
    constructor(options) {
        super(options);
        this.state = this.showState("default")
    }
   
    states() {
        return {
            "default":{
                "accept":"upsell_1",
                "decline":null,
                "class":RootState,
                "config":{
                    "variant_id":33113212452927,
                }
            },
            "upsell_1":{
                "accept":"upsell_2",
                "decline":"downsell_1",
                "class":UpsellOne,
            },
            "downsell_1":{
                "accept":"final_state",
                "decline":"final_state",
                "class":DownsellOne,
            },
            "upsell_2":{
                "accept":"challenge_pack",
                "decline":"downsell_2",
                "accept":"final_state",
                "decline":"final_state",
                "class":ChallengePack
            },
            "final_state":{
                "accept":null,
                "decline":null,
                "class":FinalState,
            }
        };
    }
    
}

class RootState extends DLGUpsellTree {
    constructor(parent,state) {
        this.parent = parent;
        this.state_info = this.parent.states()[state];
    }
    setupEvents() {
        super.setupEvents();
        this.target().querySelectorAll(".buy-buttons").forEach(element=>{
            element.addEventListener("click",event=>{
                this.target().querySelector(".offer-accept").scrollIntoView({block:"start",behavior:"smooth"});
            })
        });
    }
    finalize() {

    }
    textContent() {
        return `<section id="igb2e5" class="re-fk-lazy">
   <div data-secondsdelDownsellTwoay="" id="izon4h" class="fk-row max">
      <div align="center" data-secondsdelay="" id="iahlj1" class="fk-col">
         <div data-text="text" data-secondsdelay="" id="io4w9p"><b data-text="text" data-secondsdelay="">FREE BOOK
            </b>
         </div>
         <div data-text="text" data-secondsdelay="" id="iox24y"><span data-text="text" data-secondsdelay="" id="iloki">Conquer chronic illness, break free from medications &amp; finally achieve healthy living like 200,000+ success stories.<br data-text="text" data-secondsdelay=""></span></div>
         <div data-box="true" data-secondsdelay="" id="iv0mw2">
            <div data-secondsdelay="" id="i26m1g" class="embed-responsive embed-responsive-16by9"><iframe allowfullscreen="allowfullscreen" aspectratio="embed-responsive-16by9" id="iaqhjo" loop="" autoplay="autoplay" controls="controls" src="https://cdn.jwplayer.com/players/SxRZ8A9Q-4HYvQUVW.html?autoPlay=1" color="" videoid="SxRZ8A9Q-4HYvQUVW" modestbranding="" rel="" class="fk-iaqhjo embed-responsive-item"></iframe></div>
         </div>
         <div data-box="true" data-secondsdelay="" id="ie2in8"><button data-id="fkt-button-279-991-902" title="" align="center" data-secondsdelay="" data-minutesdelay="" type="button" onclick="slideWithoutHideForm(attributes, event)" action="openSectionWithoutHide" replaceproductid="" size="none" billnow="false" quantity="" price="" id="igo7li" desktopsize="none" data-text-value="GET YOUR FREE BOOK" openid="signup" openiddatatype="section" variantvalue="" offer="choose" upsell="choose" class="buy-buttons btn btn-primary btn-one-style fk-igo7li">GET YOUR FREE BOOK</button></div>
      </div>
   </div>
</section>
<section data-text="text" id="ilk189" data-secondsdelay="" class="re-fk-lazy"></section>
<section id="in9mfq" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="i9gdwu">
   </div>
   <div data-secondsdelay="" id="iw7cel" class="fk-row max">
      <div align="center" data-secondsdelay="" id="iwguad" class="fk-col">
         <div data-text="text" data-secondsdelay="" id="i3u8hy">
         </div>
         <div data-secondsdelay="" id="i6iguc">
            <div data-secondsdelay="" id="ixga36" class="fk-headline">In Dr. Livingood's new book, learn how to overcome the broken "healthcare" system &amp; 
               <b data-text="text" data-secondsdelay="">take control of your health
               </b>
            </div>
         </div>
      </div>
   </div>
</section>
<section id="ifs94u" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="i52zwa">
   </div>
   <div data-secondsdelay="" id="ip9mbr" class="fk-row max">
      <div align="center" data-secondsdelay="" id="i3ul57" class="fk-col">
         <img id="fkt-image-fc2-4a2-a20" title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676334302104_check.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676334302104_check.png" class="fk-image-defaults re-fk-lazy">
         <div data-secondsdelay="" id="ivdhv1">
            <div data-secondsdelay="" id="i8tvb6" class="fk-headline">
               <div data-text="text" data-secondsdelay="">LOSE WEIGHT QUICKLY AND KEEP IT OFF
               </div>
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="iyuji4">
         </div>
      </div>
      <div align="center" data-secondsdelay="" id="iwo4um" class="fk-col">
         <img title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676334302104_check.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676334302104_check.png" id="fkt-image-c33-b95-985" class="fk-image-defaults re-fk-lazy">
         <div data-secondsdelay="" id="i1cj9v">
            <div data-secondsdelay="" id="is5qsa" class="fk-headline">
               <div data-text="text" data-secondsdelay="">IMPLEMENT A HOLISTIC SYSTEM THAT PREVENTS (&amp; REVERSES) SICKNESS
               </div>
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="ikdo5y">
         </div>
      </div>
      <div align="center" data-secondsdelay="" id="itlbtf" class="fk-col">
         <img title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676334302104_check.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676334302104_check.png" id="fkt-image-0c6-a97-8bf" class="fk-image-defaults re-fk-lazy">
         <div data-secondsdelay="" id="iauzhk">
            <div data-secondsdelay="" id="izu5wy" class="fk-headline">
               <div data-text="text" data-secondsdelay="this.target().innerHTML = 
         </div>
         <div data-text="text" data-secondsdelay="" id="ipl8ln">
         </div>
      </div>
   </div>
</section>
<div data-secondsdelay="" id="i60u6h" class="fk-row">
   <div align="center" data-secondsdelay="" id="il126g" class="fk-col">
   </div>
   <div align="center" data-secondsdelay="" id="iat9u7" class="fk-col">
      <div data-secondsdelay="" id="iuzoyh">
         <div data-secondsdelay="" id="i717ah" class="fk-headline">
            <div data-secondsdelay="" id="ivwz7d">
               <span data-text="text" data-secondsdelay="" id="ihxyu3">
                  <span id="i9d5yq" class="cc-rte-styled">
                     <div data-text="text" data-secondsdelay="" id="is42h">
                        <div data-text="text" data-secondsdelay="" id="i7d39h">PLUS 2 FREE BONUSES
                        </div>
                     </div>
                  </span>
               </span>
            </div>
         </div>
      </div>
      <div data-secondsdelay="" align="left" id="ily7l6" class="fk-headline">
         <div data-text="text" data-secondsdelay="" id="iy6nz3">
            <i data-text="text" data-secondsdelay="" id="ijsdkt">ONLY AVAILABLE FROM THIS SITE AS PART OF THIS LIMITED-TIME PROMOTION
            </i>
         </div>
      </div>
      <div data-secondsdelay="" id="icno2v">
         <div data-secondsdelay="" align="left" id="i9ru6p" class="fk-headline">
            <div data-secondsdelay="" id="it4vig">
               <span data-text="text" data-secondsdelay="" id="i243z4">
                  <span id="iv7jhy" class="cc-rte-styled">
                     <div data-text="text" data-secondsdelay=""><span id="io4vqi" class="cc-rte-styled">VIP Seminar Recording &amp; Audiobook
                        </span>
                     </div>
                  </span>
               </span>
               <div data-text="text" data-secondsdelay="" id="iuli5v">
                  In this presentation I exclusively reveal what 25,000 of my patients who have had the MOST SUCCESS getting off of prescription medications and maintaining a healthy weight are currently doing to be the healthiest versions of themselves.
                  <div data-secondsdelay="">
                     <br data-text="text" data-secondsdelay="">
                  </div>
                  <div data-text="text" data-secondsdelay="">Conveniently listen to the audiobook when you don't have time to sit and read!
                  </div>
               </div>
            </div>
         </div>
      </div>
      <button data-id="fkt-button-ec1-bbb-9f5" title="" align="center" data-secondsdelay="" data-minutesdelay="" type="button" action="openSectionWithoutHide" replaceproductid="" size="none" billnow="false" quantity="" price="" desktopsize="none" data-text-value="GET YOUR BONUSES" largetabletsize="none" mobilesize="none" tabletsize="none" id="ijhbtl" openid="signup" openiddatatype="section" animate="none" variantvalue="" offer="choose" upsell="choose" class="buy-buttons btn btn-primary btn-one-style fk-ik3acl fk-iqzz8j fk-icr09i fk-ijhbtl vwo-btn">GET YOUR BONUSES</button>
   </div>
</div>
<section id="i7sctb" class="re-fk-lazy">
   <div data-secondsdelay="" id="icou41" class="fk-row max">
      <div align="center" data-secondsdelay="" id="i4f9yk" class="fk-col">
      </div>
   </div>
</section>
<section id="iqdshk" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="iqcbkw">
   </div>
   <div data-secondsdelay="" id="i23m3h" class="fk-row max">
      <div align="center" data-secondsdelay="" id="ii1jwl" class="fk-col">
         <div data-text="text" data-secondsdelay="" id="irbg6k">
         </div>
         <div data-secondsdelay="" id="irfe7k">
            <div data-secondsdelay="" id="il80ga" class="fk-headline">HERE'S WHY OUR HEALTHCARE SYSTEM PRODUCES SO MANY UNHEALTHY PEOPLE
            </div>
         </div>
         <hr id="idl2wd" class="fk-line horizontal-line-default">
      </div>
   </div>
</section>
<section id="ikqr4u" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="id1oui">
   </div>
   <div data-secondsdelay="" id="isoi7y" class="fk-row max">
      <div align="center" data-secondsdelay="" id="ivp51x" class="fk-col">
         <div data-text="text" data-secondsdelay="" id="i7i3ht" align="left">
            <div data-text="text" data-secondsdelay="" id="ix18m6">Why do so many people struggle with nagging health problems like 
               <b data-text="text" data-secondsdelay="">chronic illness, overreliance on medication,
               </b> and 
               <b data-text="text" data-secondsdelay="">weight issues
               </b>?
            </div>
            <div data-text="text" data-secondsdelay="" id="ix18m6-2">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="" id="ix18m6-3">The truth is, it's not their fault.
            </div>
            <div data-text="text" data-secondsdelay="" id="ix18m6-3-2">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="" id="ix18m6-4">They've been failed by a broken healthcare system that focuses on sickness instead of health...
            </div>
            <div data-text="text" data-secondsdelay="" id="ix18m6-4-2">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="" id="ix18m6-5">And since this system only takes action to 
               <b data-text="text" data-secondsdelay="">treat
               </b> problems but not to 
               <b data-text="text" data-secondsdelay="">prevent
               </b> them, it's no surprise there are a lot of problems (i.e., a lot of unhealthy people).
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="iqvkig">
         </div>
      </div>
      <div align="center" data-secondsdelay="" id="iaz2wg" class="fk-col">
         <div data-text="text" data-secondsdelay="" id="iwdd6m" align="left">
            <div data-text="text" data-secondsdelay="" id="i7x0gt">To make matters worse, most "treatments" target the symptoms of an illness but not its cause.
            </div>
            <div data-secondsdelay="" id="i0xl8l">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="" id="iqc4up">That means people are often left to suffer through a never-ending cycle of pills, discomfort, and doctors' offices...
            </div>
            <div data-secondsdelay="" id="ignc48">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="" id="iymdcn">All while the underlying cause of their sickness is never addressed and they never experience 
               <b data-text="text" data-secondsdelay="">true health
               </b>.
            </div>
            <div data-secondsdelay="" id="i2e3qz">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="" id="i0qud9">And I've experienced all of this firsthand.
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="ipc7mg">
         </div>
      </div>
   </div>
</section>
<section id="iylehj">
   <div data-secondsdelay="" id="id6tv2" class="fk-row max">
      <div align="center" data-secondsdelay="" id="i2w87i" class="fk-col">
         <div data-secondsdelay="" align="left" id="iozd9y" class="fk-headline">
            <div data-secondsdelay="" id="imns3g">
               <span data-text="text" data-secondsdelay="" id="iebzax">
                  <span id="in38ng" class="cc-rte-styled">
                     <div data-text="text" data-secondsdelay=""><span id="itqpwv" class="cc-rte-styled">Hi, I'm Dr. Blake Livingood
                        </span>
                     </div>
                  </span>
               </span>
               <div data-secondsdelay="" align="left" id="i1z3gx" class="fk-headline">
                  <div data-text="text" data-secondsdelay="" id="iemol1">
                     <i data-text="text" data-secondsdelay="" id="inuhf9">(YES, THAT IS MY REAL NAME)
                     </i>
                  </div>
               </div>
               <div data-text="text" data-secondsdelay="" id="ise9wv">I'm a Doctor of Natural Medicine, and I've helped hundreds of thousands of people achieve true health.
               </div>
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="i6ncfb">
         </div>
      </div>
      <div align="center" data-secondsdelay="" id="ii8vas" class="fk-col"><img title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676339854728_Dr_Livingood_Real_Doctor.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676339854728_Dr_Livingood_Real_Doctor.png" id="fkt-image-0dd-4a2-bd5" class="fk-image-defaults re-fk-lazy"></div>
   </div>
</section>
<section id="ij00ai" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="ik12bx">
   </div>
   <div data-secondsdelay="" id="iy9gfu" class="fk-row max">
      <div align="center" data-secondsdelay="" id="inse4r" class="fk-col">
         <div data-text="text" data-secondsdelay="" id="ilq8mn">
         </div>
         <img id="fkt-image-70e-58f-ad9" title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676340997327_DRL_Family.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676340997327_DRL_Family.png" class="fk-image-defaults re-fk-lazy">
      </div>
      <div align="center" data-secondsdelay="" id="il349z" class="fk-col">
         <div data-secondsdelay="" align="left" id="ifhmgd" class="fk-headline">
            <div data-text="text" data-secondsdelay="">HOW I CREATED A 21-DAY WELLNESS FORMULA THAT DEFIED THE BROKEN HEALTHCARE SYSTEM AND SAVED MY FATHER'S LIFE
            </div>
         </div>
         <hr id="ih4ks6" class="fk-line horizontal-line-default">
         <div data-text="text" data-secondsdelay="" align="left" id="ipz92m">
            <div data-text="text" data-secondsdelay="">I was 18 months into getting my doctorate when I got a call from my mother, crying. 
               <b data-text="text" data-secondsdelay="">My father was sick.
               </b>
            </div>
            <div data-text="text" data-secondsdelay="">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="">This was a man who had passed physicals for 30 years to work for UPS, but here he was —
               <b data-text="text" data-secondsdelay=""> at just 51 years old
               </b> — experiencing so much pain and inflammation that he could barely see or hear.
            </div>
            <div data-text="text" data-secondsdelay="">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="" id="ccdynamiclabel321">After 
               <b data-text="text" data-secondsdelay="">2 years 
               </b>of going through the "healthcare" system, he was on 15 medications, had multiple surgeries, and had racked up <span data-cc-check-decimal="true" data-cc-price="200,000">$200,000</span> in medical debt...
            </div>
            <div data-text="text" data-secondsdelay="">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="">Yet his condition was only getting worse.
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="ibgb9q">
         </div>
      </div>
   </div>
</section>
<section id="irsg59" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="izcyu3">
   </div>
   <div data-secondsdelay="" id="isthd3" class="fk-row max">
      <div align="center" data-secondsdelay="" id="i96o9j" class="fk-col">
         <div data-text="text" data-secondsdelay="" id="iiva19">
         </div>
         <img id="fkt-image-4b6-795-b70" title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676341287907_DRL_Dad.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676341287907_DRL_Dad.png" class="fk-image-defaults re-fk-lazy">
      </div>target() {
        return document.querySelector(this.config.injection_point);
    }sdelay="">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="">Within 90 days, my dad was off all of his prescriptions and back to living his life — biking, fishing, and best of all, he was able to attend my wedding.
            </div>
            <div data-text="text" data-secondsdelay="">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="">Now, I've taken that holistic solution and turned it into a 21-Day Wellness Formula to help people like you enjoy a healthier lifestyle.
            </div>
            <div data-text="text" data-secondsdelay="">
               <br data-text="text" data-secondsdelay="">
            </div>
            <div data-text="text" data-secondsdelay="">So if the healthcare and wellness industries have let you down, and you're looking for a natural way to avoid preventable illness or overcome nagging issues...
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="ixa2f5">
         </div>
      </div>
   </div>
</section>
<section id="ioz3dy">
   <div data-secondsdelay="" id="i08n12" class="fk-row max">
      <div align="center" data-secondsdelay="" id="infcen" class="fk-col"><img title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676305773494_Livingood_Daily_Book.webp" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676305773494_Livingood_Daily_Book.webp" id="fkt-image-0c7-7b6-a12" class="fk-image-defaults re-fk-lazy"></div>
      <div align="center" data-secondsdelay="" id="iggt5q" class="fk-col">
         <div data-secondsdelay="" align="left" id="iinvag" class="fk-headline">
            <div data-secondsdelay="" id="iiuek4">
               <span data-text="text" data-secondsdelay="" id="i3caln">
                  <span id="ilvu15" class="cc-rte-styled"><span id="il3r7u" class="cc-rte-styled">Then <b data-text="text" draggable="true" data-highlightable="1" data-secondsdelay="" id="ibua2i">grab your free copy of my new book
                  </b>, and join the <b data-text="text" draggable="true" data-highlightable="1" data-secondsdelay="" id="i8ig5c">200,000+ people
                  </b> who are already using my Wellness Formula to live better every single day.</span></span>
                  <span id="id88kl" class="cc-rte-styled">
                     <div data-text="text" data-secondsdelay="" id="iir488">
                     </div>
                  </span>
               </span>
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="ie2xus">
         </div>
      </div>
   </div>
</section>
<section id="icrfmm" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="ift6do">
   </div>
   <div data-secondsdelay="" id="ivrudu" class="fk-row max">
      <div align="center" data-secondsdelay="" id="i6i6uh" class="fk-col">
         <div data-text="text" data-secondsdelay="" id="ifekq1">
         </div>
         <div data-secondsdelay="" id="ivck1a">
            <div data-secondsdelay="" id="i99y9l" align="center" class="fk-headline">
               <div data-text="text" data-seconds

            }
        }delay="">WHY GET THIS FREE BOOK?
               </div>
            </div>
         </div>
      </div>
   </div>
</section>
<section id="i6rmrh" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="iueolh">
   </div>
   <div data-secondsdelay="" id="i8nrvt" class="fk-row max">
      <div align="center" data-secondsdelay="" id="idpfmo" class="fk-col">
         <img id="fkt-image-ba4-c93-810" title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676657747072_guide.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676657747072_guide.png" class="fk-image-defaults re-fk-lazy">
         <div data-secondsdelay="" id="iqsq6k">
            <div data-secondsdelay="" id="inv06e" class="fk-headline">
               <div data-text="text" data-secondsdelay="">
                  <span data-text="text" data-secondsdelay="" id="i98iq2">GET AN IN-DEPTH GUIDE ON HOW TO LIVE A HEALTHY LIFESTYLE</span>
               </div>
            </div>
         </div>
         <hr id="iguv6z" class="fk-line horizontal-line-default">
         <div data-text="text" data-secondsdelay="" align="left" id="ihbvwi">
            <div data-text="text" data-secondsdelay="" id="iqnc3y">This book gives you a complete action plan for addressing the biggest things affecting your health, including the 5 F's: Food, Fitness, Frame, Filters &amp; Focus.
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="i5b1uf">
         </div>
      </div>
      <div align="center" data-secondsdelay="" id="izjp79" class="fk-col">
         <img id="fkt-image-993-c82-a19" title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676657790745_weight.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676657790745_weight.png" class="fk-image-defaults re-fk-lazy">
         <div data-secondsdelay="" id="i97eej">
            <div data-secondsdelay="" id="iv3pun" class="fk-headline">
               <div data-text="text" data-secondsdelay="">LOSE WEIGHT QUICKLY AND KEEP IT OFF
               </div>
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="i922pg">
         </div>
         <hr id="ini68o" class="fk-line horizontal-line-default">
         <div data-text="text" data-secondsdelay="" align="left" id="idwfj6">
            <div data-text="text" data-secondsdelay="" id="iaoqzi">Most people lose weight to get healthy, when they should be getting healthy to lose weight. This 21-Day Wellness Guide will show you how to shed pounds without starving yourself.  
            </div>
         </div>
      </div>
      <div align="center" data-secondsdelay="" id="iygb1g" class="fk-col">
         <img id="fkt-image-5b7-5b8-9d4" title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676657768040_holistic.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676657768040_holistic.png" class="fk-image-defaults re-fk-lazy">
         <div data-secondsdelay="" id="ip3xqq">
            <div data-secondsdelay="" id="iokx2o" class="fk-headline">
               <div data-text="text" data-secondsdelay="">IMPLEMENT A HOLISTIC SYSTEM THAT PREVENTS AND REVERSES SICKNESS
               </div>
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="i3fshu">
         </div>
         <hr id="i9bfea" class="fk-line horizontal-line-default">
         <div data-text="text" data-secondsdelay="" align="left" id="iz1kmx">
            <div data-text="text" data-secondsdelay="" id="iq0n4g">The best doctor in the world lives inside your own body. Learn how to remove the things standing in the way of your body's natural healing power.
            </div>
         </div>
      </div>
   </div>
</section>
<section id="igqa2t">RootState
   <div data-secondsdelay="" id="i91s1h" class="fk-row max">
      <div align="center" data-secondsdelay="" id="idi6kj" class="fk-col"><img id="fkt-image-346-abb-be0" title="" target="_self" src="https://assets.funnelkonnekt.com/Funnel/assets/images/621e4ce1-6a89-489d-aa82-a88c2d48b8ca/8ecca7c0-eabc-438e-b6f2-4ff7f6adbdb2/1676415090891_Screen_Shot_2019_04_30_at_2.31.30_PM.png?versionId=VcqfQFrtW66eRfxy69JhiJtJrC6aFgyA" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/Funnel/assets/images/621e4ce1-6a89-489d-aa82-a88c2d48b8ca/8ecca7c0-eabc-438e-b6f2-4ff7f6adbdb2/1676415090891_Screen_Shot_2019_04_30_at_2.31.30_PM.png?versionId=VcqfQFrtW66eRfxy69JhiJtJrC6aFgyA" crossorigin="anonymous" class="fk-image-defaults re-fk-lazy"></div>
   </div>
</section>
<section id="io4w8" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="is1yy2">
   </div>
   <div id="ivgzf" data-secondsdelay="" class="fk-row max">
      <div align="center" id="imxpi" data-secondsdelay="" class="fk-col">
         <div data-text="text" id="i8v8d" data-secondsdelay="">
         </div>
         <div data-secondsdelay="" id="igfr0a">
            <div data-secondsdelay="" id="iw4cy4" class="fk-headline">SUCCESS STORIES
            </div>
         </div>
      </div>
   </div>
</section>
<section id="i55y2z" class="re-fk-lazy">
   <div data-text="text" data-secondsdelay="" id="i6m4uf">
   </div>
   <div data-secondsdelay="" id="iqvb0i" class="fk-row max">
      <div align="center" data-secondsdelay="" id="i3jbw6" class="fk-col">
         <div data-secondsdelay="" id="iovjpr" class="embed-responsive embed-responsive-1by1"><iframe allowfullscreen="allowfullscreen" aspectratio="embed-responsive-1by1" id="i21kah" loop="" autoplay="" controls="controls" src="https://fast.wistia.net/embed/iframe/hnaet2mogz?" color="" videoid="hnaet2mogz" modestbranding="" rel="" data-src="https://fast.wistia.net/embed/iframe/hnaet2mogz?" class="fk-i21kah embed-responsive-item re-fk-lazy"></iframe></div>
         <img title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676415369463_5_STARS.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676415369463_5_STARS.png" id="fkt-image-57b-caf-8a1" class="fk-image-defaults fk-disable-lazy">
         <div data-secondsdelay="" id="ihc2ps">
            <div data-secondsdelay="" id="i3gt4h" class="fk-headline">
               <div data-text="text" data-secondsdelay="">KAREN HARPER
               </div>
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="i067sh"><iframe allowfullscreen="allowfullscreen" aspectratio="embed-responsive-1by1" id="ikadej" loop="" autoplay="" controls="controls" src="https://fast.wistia.net/embed/iframe/0rux9njzh8?" color="" videoid="0rux9njzh8" modestbranding="" rel="" data-src="https://fast.wistia.net/embed/iframe/0rux9njzh8?" class="fk-ikadej embed-responsive-item re-fk-lazy"></iframe></div>
         <img title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676415369463_5_STARS.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676415369463_5_STARS.png" id="fkt-image-91c-2a7-a71" class="fk-image-defaults fk-disable-lazy">
         <div data-secondsdelay="" id="i4snmp">
            <div data-secondsdelay="" id="ieat4z" class="fk-headline">
               <div data-text="text" data-secondsdelay="">KATHERINE MANNA
               </div>
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="ighv2j">
         </div>
      </div>
      <div align="center" data-secondsdelay="" id="ik7jgo" class="fk-col">
         <div data-secondsdelay="" class="embed-responsive embed-responsive-1by1"><iframe allowfullscreen="allowfullscreen" aspectratio="embed-responsive-1by1" id="ic6ujj" loop="" autoplay="" controls="controls" src="https://fast.wistia.net/embed/iframe/3s8vq65147?" color="" videoid="3s8vq65147" modestbranding="" rel="" data-src="https://fast.wistia.net/embed/iframe/3s8vq65147?" class="fk-ic6ujj embed-responsive-item re-fk-lazy"></iframe></div>
         <img id="fkt-image-af5-6be-b97" title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676415369463_5_STARS.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676415369463_5_STARS.png" class="fk-image-defaults fk-disable-lazy">
         <div data-secondsdelay="" id="iw8qfr">
            <div data-secondsdelay="" id="i6ppsn" class="fk-headline">
               <div data-text="text" data-secondsdelay="">ROBYN PRESLEY
               </div>
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" id="ibv8y2">
         </div>
      </div>
   </div>
</section>
<section id="it8xce" class="re-fk-lazy fk-disable-lazy">
   <div data-text="text" data-secondsdelay="" id="iubqs8">
   </div>
   <div data-secondsdelay="" id="iwqotx" class="fk-row max">
      <div align="center" data-secondsdelay="" id="ifujmj" class="fk-col">
         <div data-text="text" data-secondsdelay="" id="ifcrql">
         </div>
         <img id="fkt-image-bb0-c94-ab9" title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676417867054_GUARANTEE.png" href="" align="center" alt="" width="" height="" onclick="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676417867054_GUARANTEE.png" class="fk-image-defaults fk-disable-lazy">
         <div data-secondsdelay="" id="i4wvq1">
            <div data-secondsdelay="" id="i5mp8s" class="fk-headline">100% SATISFACTION GUARANTEE
            </div>
         </div>
         <div data-text="text" data-secondsdelay="" align="center" id="i1veje">
            <div data-text="text" data-secondsdelay="">I know 
               <b data-text="text" data-secondsdelay="">you're going to love this 21-Day Wellness Guide
               </b>. And on the extremely rare chance that you don’t, we don’t even request that you go through the hassle of sending the book back. Hold on to it or gift it to a loved one.&nbsp;
               <span data-text="text" data-secondsdelay="" id="ihdh1h">All we ask is that you kindly contact our AMAZING support team at <a id="fkt-link-ad9-d87-b4d" data-id="fkt-link-5fe-382-bb5" title="" target="_blank" action="none" align="center" animate="none" speed="none" delay="none" loop="none" variantvalue="" data-secondsdelay="" data-minutesdelay="" replaceproductid="" billnow="false" href="https://support.drlivingood.com?tid=&amp;ADID=&amp;session_time=1715019591&amp;h_ad_id=" offer="choose" upsell="choose" quantity="" price="" style="cursor: pointer;">support.drlivingood.com</a></span><span data-text="text" data-secondsdelay="" id="iyam5y"> and they will be thrilled to help you with your order.</span>
            </div>
         </div>
      </div>
   </div>
</section>
   <section id="signup" class="re-fk-lazy fk-hide-on-load" style="visibility: visible;" tabindex="-1">
   <div data-secondsdelay="" id="iei2wo" class="fk-row max">
      <div align="center" data-secondsdelay="" id="ib5lhk" class="fk-col">
         <div data-secondsdelay="" id="ig0l8w">
            <div data-secondsdelay="" id="ia66h9" class="fk-headline">
               <div data-secondsdelay="" id="ivzowk">
                  <span data-text="text" data-secondsdelay="" id="im9uwd">
                     <span id="ihoci9" class="cc-rte-styled">
                        <div data-text="text" data-secondsdelay="" id="ixpt9j">
                           <div data-text="text" data-secondsdelay="" id="i5kyod">
                              <div data-text="text" data-secondsdelay="" id="iaghk7">FREE BOOK+BONUS SEMINAR &amp; AUDIOBOOK
                              </div>
                           </div>
                        </div>
                     </span>
                  </span>this.target().innerHTML = 
               </div>
            </div>
         </div>
         <div data-secondsdelay="" id="ia6o86">
            <div data-secondsdelay="" align="left" id="iz4n28" class="fk-headline">
               <div data-secondsdelay="" id="if4p7b">
                  <span data-text="text" data-secondsdelay="" id="i94ukp">
                     <span id="i4r5u5" class="cc-rte-styled">
                        <div data-text="text" data-secondsdelay="" id="iyx31h">
                           <div data-text="text" data-secondsdelay="" id="iqts2n">Get your&nbsp;
                              <b data-text="text" draggable="true" data-secondsdelay="" id="i09zsl">21-Day Wellness Formula&nbsp;
                              </b>now!
                           </div>
                        </div>
                     </span>
                  </span>
               </div>
            </div>
         </div>
         <div data-secondsdelay="" id="i9zj7o" class="io-attrs fk-element-container">
         </div>
         <img title="" target="_self" src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676305773494_Livingood_Daily_Book.webp" align="center" alt="" width="" height="" data-src="https://assets.funnelkonnekt.com/a9d47570-a732-11ed-948d-ebf98ecf00db/1676305773494_Livingood_Daily_Book.webp" id="fkt-image-f47-fab-8bb" href="" onclick="" class="fk-image-defaults re-fk-lazy">
      </div>
      
      <div align="center" data-secondsdelay="" id="isctc3g-4-3" class="fk-col">
         <div id="ipm6rw6" data-secondsdelay="" class="form-check bump-div-class">
            <fieldset>
                <div><input type="radio" name="variant" value="2432143" id="variant-2432143">
                <label for="variant-2432143">FREE Livingood Daily Book</label>
                </div>
                <div><input type="radio" name="variant" value="2432144" id="variant-2432144">
                <label for="variant-2432143">FREE Livingood Daily Book + 90% OFF FULL NUTRITION CORRECTION COURSE! Make Nutrition Simple Course - $19
                <br><span data-cc-check-decimal="true" data-cc-price="19">$19</span></strong><span data-text="text" id="itsqmwu" align="left" data-secondsdelay="">Want A HUGE 90% Discount On This Full Nutrition Training Course? 9 fully comprehensive video modules with Dr. Livingood designed to help you correct your nutrition so you can use food to help you burn fat and boost health. PLUS learn the secret food hacks that will allow you to eat like an elephant and look like a gazelle! Check YES above to add this special offer to your order now for just <span data-cc-check-decimal="true" data-cc-price="19">$19</span>. (NORMALLY <span data-cc-check-decimal="true" data-cc-price="19">$19</span>7! Save <span data-cc-check-decimal="true" data-cc-price="180">$180</span> TODAY! This offer is not available at ANY other time or place) This is a DIGITAL course, not a physical CD set.</span>
                </label>
                </div>
                <button data-id="fkt-button-ba2-79f-afc" title="submit order" align="center" data-secondsdelay="" data-minutesdelay="" type="button"   replaceproductid="" size="none" quantity="" price="" id="i6gell2" desktopsize="none" data-text-value="Secure My Order(Only Press Button One Time)" mobilesize="none" billnow="false" variantvalue="" offer="choose" upsell="choose" class="btn btn-primary fk-i6gell2 vwo-btn cobn offer-accept">Secure My Order(Only Press Button One Time)</button>
        </div>
      </div>
  </div>
</section>

<div data-secondsdelay="" id="i01s3-3" class="fk-row fk-footer-row">
   <div align="center" data-secondsdelay="" id="i653z" class="fk-col fk-footer-col">
      <div align="left" data-secondsdelay="" id="i8icc" class="fk-headline fk-footer-headline">*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare professional prior to beginning any diet or exercise program or taking any dietary supplement. The content on our website is for informational and educational purposes only and is not intended as medical advice or to replace a relationship with a qualified healthcare professional.
      </div>
      <div data-secondsdelay="" class="fk-inner-row">
         <div align="center" data-secondsdelay="" id="io1ow" class="fk-inner-column">
         </div>
         <div align="right" data-secondsdelay="" id="injr6" class="fk-inner-column">
         </div>
      </div>
      <div data-secondsdelay="" class="fk-inner-row">
         <div align="center" data-secondsdelay="" class="fk-inner-column"><a id="fkt-link-1e0-890-8e5" data-id="fkt-link-22a-9b2-9dc" title="Enter link text here" target="_blank" action="choose" align="left" animate="none" speed="none" delay="none" loop="none" variantvalue="" data-secondsdelay="" data-minutesdelay="" replaceproductid="" billnow="false" href="https://store.drlivingood.com/policies/refund-policy?tid=&amp;ADID=&amp;session_time=1715019591&amp;h_ad_id=" offer="choose" upsell="choose" quantity="" price="" style="cursor: pointer;">Refund Policy</a><a id="fkt-link-415-791-bdd" data-id="fkt-link-415-791-bdd" title="Enter link text here" target="_self" action="choose" align="left" animate="none" speed="none" delay="none" loop="none" variantvalue="" data-secondsdelay="" data-minutesdelay="" replaceproductid="" billnow="false" href="https://store.drlivingood.com/policies/terms-of-service?tid=&amp;ADID=&amp;session_time=1715019591&amp;h_ad_id=" offer="choose" upsell="choose" quantity="" price="" style="cursor: pointer;">Terms &amp; Conditions</a><a id="fkt-link-91e-e88-a31" data-id="fkt-link-91e-e88-a31" title="Enter link text here" target="_blank" action="choose" align="left" animate="none" speed="none" delay="none" loop="none" variantvalue="" data-secondsdelay="" data-minutesdelay="" replaceproductid="" billnow="false" href="https://store.drlivingood.com/policies/privacy-policy?tid=&amp;ADID=&amp;session_time=1715019591&amp;h_ad_id=" offer="choose" upsell="choose" quantity="" price="" style="cursor: pointer;">Privacy Policy</a></div>
      </div>
      <div data-secondsdelay="" class="fk-inner-row">
      </div>
   </div>
</div>
<section data-text="text" id="form" data-secondsdelay=""></section>
<div data-text="text" data-secondsdelay="" id="ixhzgi"></div>
<div id="ibfdws" data-secondsdelay="" class="fk-row">
   <div align="center" data-secondsdelay="" class="fk-col">
   </div>
</div>
        `
    }
}
class FinalState extends DLGUpsellTree {
    constructor(parent,state) {
        super(parent,state);
    }
    textContent() {
        return `
            <section data-v-33b5f914="" id="6386" class="section wide"><div data-v-b46c944c="" data-v-33b5f914="" id="439952" data-secondsdelay="" class="section_row"><div data-v-796cd32d="" data-v-b46c944c="" id="i6xwz" data-secondsdelay="" class="row-column"><div data-v-fe9ccef8="" data-v-796cd32d="" data-secondsdelay="" class="element-wrapper"><div data-v-fe9ccef8="" id="ik6mk-2" data-secondsdelay="" class="img el-594535"><img crossorigin="anonymous" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-srcset="//img.funnelish.com/5631/26113/1653571894-20191102_Livingood-RealLife-LanghoffCreative-121.jpeg 1x" alt="" data-sizes="auto" data-src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" width="500px" height="auto" id="fkt-image-535-f97-a60" title="" target="_self" href="" align="center" onclick="" class="re-fk-lazy lazyautosizes lazyloaded" loading="lazy" sizes="500px" srcset="//img.funnelish.com/5631/26113/1653571894-20191102_Livingood-RealLife-LanghoffCreative-121.jpeg 1x"></div></div><div data-v-fe9ccef8="" data-v-796cd32d="" data-secondsdelay="" class="element-wrapper"><div data-v-fe9ccef8="" id="irs1b" data-secondsdelay="" class="headline el-238142"><div data-secondsdelay="" class="headline-inner"><h1 id="i6ipo"><strong data-text="text" id="iyw9d" data-secondsdelay="">Welcome To The Livingood Daily Family!</strong></h1><h1 id="iovj4"><br data-text="text" data-secondsdelay=""></h1><h2 id="ildf1"><span data-text="text" id="i7xzx" data-secondsdelay="">Please Follow These Important Next Steps...</span></h2></div></div></div><div data-v-fe9ccef8="" data-v-796cd32d="" data-secondsdelay="" class="element-wrapper"><div data-v-fe9ccef8="" id="igjcc" data-secondsdelay="" class="paragraph el-581152"><div data-secondsdelay="" class="paragraph-inner"><ul><li data-text="text" data-secondsdelay="" id="ijiqo"><strong data-text="text" draggable="true" data-highlightable="1" data-secondsdelay="" id="iz8ew">In 60 minutes,&nbsp;</strong>check your email for your order confirmation. If you don't see an email from "Livingood Daily", check your Junk mail/spam &amp; promotional folders and make sure to mark the email "Not Spam."
			<br data-text="text" data-secondsdelay=""></li></ul><p><br data-text="text" data-secondsdelay=""></p><ul><li data-text="text" data-secondsdelay="" id="iggn6i">​
			<strong data-text="text" draggable="true" data-secondsdelay="">Within the next 2-3 days</strong>, you will receive another email with your tracking ID and a link that allows you to check on your shipment. Please be aware, depending on your order, you may receive multiple packages.	  
			</li></ul><p id="ijif1i"><br data-text="text" data-secondsdelay=""></p><ul><li data-text="text" id="ikw4kq" data-secondsdelay=""><strong data-text="text" draggable="true" data-highlightable="1" data-secondsdelay="" id="ikuyr9">​If you have any questions</strong>&nbsp;or need support, please visit us at support.livingooddaily.com<a id="iuku1s" data-id="fkt-link-e0c-49f-92f" title="" target="_self" action="choose" align="center" animate="none" speed="none" delay="" loop="none" variantvalue="" data-secondsdelay="" data-minutesdelay="" replaceproductid="" billnow="false" href="https://support.drlivingood.com/hc/en-us?tid=&amp;ADID=&amp;session_time=1704141624&amp;h_ad_id=&amp;tid=&amp;ADID=&amp;session_time=1715019591&amp;h_ad_id=" offer="choose" upsell="choose" quantity="" price="" style="pointer-events: auto; cursor: pointer;"><br data-text="text" draggable="true" data-highlightable="1" data-secondsdelay="" id="ijx79g"></a></li></ul><p id="is2eho"><br data-text="text" data-secondsdelay=""></p></div></div></div><div data-v-fe9ccef8="" data-v-796cd32d="" data-secondsdelay="" id="ifqu46" class="element-wrapper"><div data-v-fe9ccef8="" id="igkwei" data-secondsdelay="" class="headline el-442029"><div data-secondsdelay="" class="headline-inner"><h1 id="im8hm1"><strong data-text="text" id="ii31n3" data-secondsdelay="">You've Made A Great Decision!</strong></h1></div></div></div><div data-v-fe9ccef8="" data-v-796cd32d="" data-secondsdelay="" class="element-wrapper"><div data-v-fe9ccef8="" id="ifexwz" data-secondsdelay="" class="paragraph el-265835"><div data-secondsdelay="" id="ig4cjh" class="paragraph-inner"><p id="i2ruci"><strong data-text="text" data-secondsdelay="" id="ig52gf">Hi, this is Dr. Livingood, the founder of Livingood Daily.</strong></p><p><br data-text="text" data-secondsdelay=""></p><p data-text="text" data-secondsdelay="" id="ib2s6p">I want to congratulate you on taking action on your health and trusting us to guide you to experience REAL health. Trust me when I say, we are extremely grateful you are here and our team does not take your commitment lightly.
			<br data-text="text" data-secondsdelay=""></p><p id="iju26m"><br data-text="text" data-secondsdelay=""></p><p data-text="text" data-secondsdelay="" id="ix8qm5">I know you're going to see major improvements in your health, energy and mental state when you start applying the Livingood Daily Book to your life.
			<br data-text="text" data-secondsdelay=""></p><p><br data-text="text" data-secondsdelay=""></p><p data-text="text" data-secondsdelay="" id="iz5n8j">To thank you, I'm sending you the&nbsp; 
			<strong data-text="text" draggable="true" data-secondsdelay="">free digital bonuses</strong>&nbsp;I told you about earlier that came with your book.
			<br data-text="text" data-secondsdelay=""></p><p id="igouwv"><br data-text="text" data-secondsdelay=""></p><p data-text="text" data-secondsdelay="" id="ikaqpp">In a little while, you'll receive an email that will include links. These links will allow you to download all of your bonus materials.
			<br data-text="text" draggable="true" data-secondsdelay=""></p><p id="iyvcrd"><br data-text="text" data-secondsdelay=""></p><p data-text="text" id="i2vfb1" data-secondsdelay="">Right now, I need to mention something that is&nbsp;
			<b><u data-text="text" data-secondsdelay="">critical
			</u></b> for your future success...
		</section>
        `
    }

}
class UpsellOne extends DLGUpsellTree {
    constructor(parent,state) {
        super(parent,state);
    }
    textContent() {
        return `
            <h2>${this.constructor.name}</h2>
            <div><button class="offer-accept">Accept</button>
            <div><button class="offer-decline">decline</button></div>
        `
    }
    finalize() {

    }
    setupEvents() {
        super.setupEvents();
    }
}
class UpsellTwo extends DLGUpsellTree {
    constructor(parent,state) {
        super(parent,state);
    }
    textContent() {
        return `
            <h2>${this.constructor.name}</h2>
            <div><button class="offer-accept">Accept</button>
            <div><button class="offer-decline">decline</button></div>
        `
    }
    finalize() {

    }
    setupEvents() {
        super.setupEvents();
    }
}
class DownsellOne extends DLGUpsellTree {
    constructor(parent,state) {
        super(parent,state);
    }
    textContent() {
        return `
            <h2>${this.constructor.name}</h2>
            <div><button class="offer-accept">Accept</button>
            <div><button class="offer-decline">decline</button></div>
        `
    }
    finalize() {

    }
    setupEvents() {
        super.setupEvents();
    }
}
class DownsellTwo extends DLGUpsellTree {
    constructor(parent,state) {
        super(parent,state);
    }
    textContent() {
        return `
            <h2>${this.constructor.name}</h2>
            <div><button class="offer-accept">Accept</button>
            <div><button class="offer-decline">decline</button></div>
        `
    }
    finalize() {

    }
    setupEvents() {
        super.setupEvents();
    }
}
class ChallengePack extends DLGUpsellTree {
    constructor(parent,state) {
        super(parent,state);
    }
    textContent() {
        return `
            <h2>${this.constructor.name}</h2>
            <div><button class="offer-accept">Accept</button>
            <div><button class="offer-decline">decline</button></div>
        `
    }
    finalize() {

    }
    setupEvents() {
        super.setupEvents();
    }
}