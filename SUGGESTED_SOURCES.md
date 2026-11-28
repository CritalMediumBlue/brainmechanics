# Suggested additional sources for the Brain Mechanics course

This list proposes sources that would fill gaps in the course in `/workspace/course/`. The course was written only from the 43 entries in `course/references.bib`. It does not change the course itself.

## How the list was built

1. **Finding the gaps.** I read the chapter headings (`course/chapters/*.qmd`) and the "Limitations" and "Use in the course" sections of the per-paper notes (`notes/*.md`). I also searched the chapters for places where they say a source was not available, or where a number is quoted second-hand from a review. The gaps already known were: no Hodgkin–Huxley model, no written-out Boltzmann gating equation, a molecular clutch described only in words, cortical folding covered only through Van Essen 1997, no organoids, no written-out Hill equation, and embryonic brain stiffness (Iwashita 2014) known only second-hand.
2. **Mining the reference lists.** I took the reference list of every course source from `sources/markdown/` and searched them all for candidate works. For each candidate I counted how many course sources cite it and recorded its reference number. Where the course quotes a number from a review, I traced the number to the reference that the review gives for it (for example, Franze et al. 2013 Fig. 2b is "adapted from Reference 33", which is Elkin et al. 2010).
3. **Checking the details.** Authors, titles, journals, volumes and pages come from the course sources' reference lists whenever a source prints them. Every DOI is labelled with one of these tags:
   - **[DOI in source]**: the DOI is printed in the reference list of a course source (copied, not re-checked online).
   - **[DOI web-verified]**: the DOI is not printed in any course source, and I confirmed it with a web search of public bibliographic records (PubMed/PMC, publisher pages, Scilit).
   - **[DOI: not verified]**: I could not confirm a DOI.
   - **[no DOI]**: a pre-DOI publication with no DOI found.
4. **What "content" claims mean here.** When an entry says what a paper shows, the claim comes from the way a course source cites it (quoted or paraphrased, with location), or from the paper's title. Where I checked the content online, the entry says "(web-checked)". Nothing else is claimed.

"Cited by" lists course sources as `citekey #n`, where n is the item number in that source's reference list. "(alphabetical)" means the list is not numbered.

---

## High priority

These fill a gap that the course itself flags, or give the original source for a number or equation that the course now cites second-hand.

### H1. Hodgkin & Huxley 1952: the quantitative model of the action potential
- **Reference:** Hodgkin AL, Huxley AF (1952). A quantitative description of membrane current and its application to conduction and excitation in nerve. *J Physiol* 117(4):500–544.
- **DOI:** 10.1113/jphysiol.1952.sp004764 **[DOI web-verified]**. Free full text: PMC1392413.
- **Chapter:** 1 (Membrane potential), and possibly 2.
- **Why:** Chapter 1 (line 172) says that the classic action-potential model "was not available as a source for this course", so no equations, rate constants or simulator are given. The bib entry `hodgkin1952quantitative` exists but has no text. Getting the full text (it is free on PMC) would let the course write out the HH current equation, the gating variables m, h and n with their rate functions, and the squid-axon parameters, and build the planned action-potential simulator. The textbook `hille2001ion` is in the same position (in the bib, no text), and a copy of it would also help.
- **Cited by:** Not cited in the reference lists that were searched. The bib entry was chosen directly. A related paper from the same series is cited by `fairless2013membrane #20`: Hodgkin AL, Huxley AF (1952). Currents carried by sodium and potassium ions through the membrane of the giant axon of *Loligo*. *J Physiol* 116:449–472, DOI 10.1113/jphysiol.1952.sp004717 [DOI in source]. Note that this is *not* the quantitative paper.

### H2. Lewis & Grandl 2015: an explicit Boltzmann equation for Piezo1 gating
- **Reference:** Lewis AH, Grandl J (2015). Mechanical sensitivity of Piezo1 ion channels can be tuned by cellular membrane tension. *eLife* 4:e12088.
- **DOI:** 10.7554/eLife.12088 **[DOI in source]** (nourse2022piezo, pillai2024mechanics).
- **Chapter:** 11 (Mechanosensing and Piezo1: "Reported Piezo1 parameters", "Force from lipid, or from tethers?").
- **Why:** Coste 2010 and Pathak 2014 report Boltzmann fits (P50, slope s) but never write the equation, so the course cannot show it. This paper writes the fit function out in its figure legends, I = Imax/(1+exp(−(T−T50)/k)), and reports half-activation tensions T50 in mN/m under several conditions (1.4 to 4.7 mN/m depending on prepulse and patch configuration) (web-checked). That gives a citable equation and a tension-based parameter to set beside the pressure-based P50 values in the course. Note: 1.4 mN/m is the value with a +5 mmHg prepulse, not a general Piezo1 T50.
- **Cited by:** nourse2022piezo #28; pillai2024mechanics #75.

### H3. Chan & Odde 2008: the quantitative motor–clutch model
- **Reference:** Chan CE, Odde DJ (2008). Traction dynamics of filopodia on compliant substrates. *Science* 322:1687–1691.
- **DOI:** 10.1126/science.1163595 **[DOI in source]** (koser2016mechanosensing).
- **Chapter:** 8 ("The molecular clutch"), 10.
- **Why:** The course's clutch is qualitative (Mitchison & Kirschner 1988). Its stiffness-sensing paragraph ("load-and-fail" below ~1 kPa, "frictional slippage" on stiffer substrates, embryonic chick forebrain neurons) is cited second-hand from Franze 2013 and Tyler 2012. Tyler annotates this paper as one that "provides a quantitative description of a 'motor-clutch' model". It is the primary source both for that claim and for any clutch simulator.
- **Cited by:** franze2013mechanics #14; koser2016mechanosensing #7; tyler2012mechanobiology #37 (annotated).

### H4. Iwashita et al. 2014: stiffness of the embryonic mouse brain
- **Reference:** Iwashita M, Kataoka N, Toida K, Kosodo Y (2014). Systematic profiling of spatiotemporal tissue and cellular stiffness in the developing brain. *Development* 141:3793–3798.
- **DOI:** 10.1242/dev.109637 **[DOI in source]** (5 sources).
- **Chapter:** 6 (Mouse embryo anatomy), 10 (Tissue mechanics), 12 (Frontier).
- **Why:** All the in-vivo developmental stiffness data in the course are from *Xenopus* (Koser 2016, Thompson 2019, Pillai 2026). The note on koser2016 records that mouse embryonic cortex stiffness is known only from a citation of this paper ("region- and developmental stage-dependent"). It is the most-cited primary source on embryonic mammalian brain stiffness among the course sources, and the only direct way to add mouse values to the stiffness ladder and to the timeline in chapter 6.
- **Cited by:** koser2016mechanosensing #20; kreysing2025environmental #41; long2019extracellular #112; pillai2024mechanics #18; thompson2019rapid #26.

### H5. Koch et al. 2012: growth-cone traction forces (537 pN vs 71 pN)
- **Reference:** Koch D, Rosoff WJ, Jiang J, Geller HM, Urbach JS (2012). Strength in the periphery: growth cone biomechanics and substrate rigidity response in peripheral and central nervous system neurons. *Biophys J* 102:452–460.
- **DOI:** 10.1016/j.bpj.2011.12.025 **[DOI in source]** (koser2016mechanosensing, kreysing2025environmental).
- **Chapter:** 8 ("How large are the forces?"), 12.
- **Why:** Chapter 8 quotes ~537 pN (DRG) and 71 pN (hippocampal) growth-cone traction forces, and builds a prediction exercise on them. These numbers come from Tyler 2012, whose footnote for them is ref. 87, this paper. Franze 2013 (ref. 123) cites it for "Growth cones of PNS neurons exert several-fold-larger forces than do CNS neurons".
- **Cited by:** franze2013mechanics #123; koser2016mechanosensing #10; kreysing2025environmental #21; pillai2024mechanics #63; tyler2012mechanobiology #87.

### H6. Betz et al. 2011: growth cones as soft and weak force generators (~30 Pa)
- **Reference:** Betz T, Koch D, Lu YB, Franze K, Käs JA (2011). Growth cones as soft and weak force generators. *Proc Natl Acad Sci USA* 108:13420–13425.
- **DOI:** 10.1073/pnas.1106145108 **[DOI in source]** (koser2016mechanosensing).
- **Chapter:** 8 ("How large are the forces?"), 10.
- **Why:** Chapter 8 states "an internal stress of about 30 Pa in a growth cone" from Franze 2013 p. 239, and Franze gives ref. 13 (this paper) for it. Citing it would also give the primary source for the growth-cone stiffness of order 100 Pa quoted in chapter 10, but that attribution has to be checked first.
- **Cited by:** franze2013mechanics #13; koser2016mechanosensing #9; tyler2012mechanobiology #36.

### H7. Elkin, Ilankovan & Morrison 2010: strain stiffening of rat brain (150–300 Pa to >2,000 Pa)
- **Reference:** Elkin BS, Ilankovan A, Morrison B III (2010). Age-dependent regional mechanical properties of the rat hippocampus and cortex. *J Biomech Eng* 132:011010.
- **DOI:** 10.1115/1.4000164 **[DOI in source]** (koser2016mechanosensing, kreysing2025environmental). Kreysing gives the year as 2009 (online publication), the others 2010.
- **Chapter:** 10 ("One number is not enough: rate and strain"), 8 (force/stiffness ladder).
- **Why:** The course states "AFM gave 150–300 Pa at 5% strain, but hippocampal regions exceeded 2,000 Pa at 30% strain" from Franze 2013 p. 232. Franze's Fig. 2b, which shows these data, is "adapted from Reference 33", which is this paper. The ladder in chapter 8 even says "rat according to the cited study's title". Franze also cites it (refs 33–36) for brain stiffness increasing with age.
- **Cited by:** franze2013mechanics #33; koser2016mechanosensing #21; kreysing2025environmental #40; pillai2024mechanics #22.

### H8. Tallinen et al. 2014: a mechanical model of gyrification
- **Reference:** Tallinen T, Chung JY, Biggins JS, Mahadevan L (2014). Gyrification from constrained cortical expansion. *Proc Natl Acad Sci USA* 111:12667–12672.
- **DOI:** 10.1073/pnas.1406015111 **[DOI in source]** (pillai2024mechanics).
- **Chapter:** 6 ("The cortical wall"), 12 (Frontier).
- **Why:** Cortical folding is now covered only by Van Essen's 1997 tension hypothesis and one ECM explant result. This paper is the modern differential-growth model of folding cited by the course's main mechanics review. It would let the course set the tension and growth hypotheses side by side. See also L8 (Tallinen 2016) and M10 (Richman 1975).
- **Cited by:** pillai2024mechanics #141.

### H9. Lancaster et al. 2013: cerebral organoids
- **Reference:** Lancaster MA, et al. (2013). Cerebral organoids model human brain development and microcephaly. *Nature* 501:373–379.
- **DOI:** 10.1038/nature12517 **[DOI in source]** (long2019extracellular).
- **Chapter:** 5 (Neuronal culture), 6 (Anatomy) or 12 (Frontier).
- **Why:** The course has no organoids, although they are now a standard 3D model for human brain development and a natural bridge between the culture chapter and the frontier chapter. This is the founding paper. For organoid mechanics, see Karzbrun 2018 (L8). pillai2024mechanics also cites an organoid-hydrogel mechanics paper (its ref. #107, "Hydrogel Mechanics Influence the Growth and Development of Embedded Brain Organoids", *ACS Appl Bio Mater* 5:214–224, 2022), which could be a follow-up.
- **Cited by:** long2019extracellular #102 (also cites Giandomenico & Lancaster 2017, #105).

### H10. Coste et al. 2012: Piezo proteins are pore-forming subunits
- **Reference:** Coste B, Xiao B, Santos JS, Syeda R, Grandl J, Spencer KS, et al. (2012). Piezo proteins are pore-forming subunits of mechanically activated channels. *Nature* 483:176–181.
- **DOI:** 10.1038/nature10812 **[DOI in source]** (koser2016mechanosensing).
- **Chapter:** 11 ("The discovery of Piezo1", "Force from lipid, or from tethers?").
- **Why:** Coste 2010 shows that Piezo1 is *required* for mechanically activated currents. This follow-up is the standard citation for Piezo being the channel itself. Four course sources cite it, which makes it the most-cited Piezo paper that is not in the bib.
- **Cited by:** koser2016mechanosensing #33; pathak2014stretch #32; pillai2026long #27; syeda2015chemical #10.

### H11. Dennerll et al. 1989 and Lamoureux et al. 1992: the primary data for towed growth
- **References:**
  - (a) Dennerll TJ, Lamoureux P, Buxbaum RE, Heidemann SR (1989). The cytomechanics of axonal elongation and retraction. *J Cell Biol* 109:3073–3083. DOI 10.1083/jcb.109.6.3073 **[DOI web-verified]**.
  - (b) Lamoureux P, Zheng J, Buxbaum RE, Heidemann SR (1992). A cytomechanical investigation of neurite growth on different culture surfaces. *J Cell Biol* 118:655–661. DOI 10.1083/jcb.118.3.655 **[DOI web-verified]** (Van Essen gives only the journal, volume and pages; the title is web-verified).
- **Chapter:** 8 ("Tension and towed growth").
- **Why:** Chapter 8's towed-growth paragraph is all cited to Van Essen 1997 p. 313: ~150 µdyn of neurite tension in chick sensory neurons, spring-like lengthening, relaxation over minutes, and active elongation above a threshold tension. Van Essen's footnotes for these statements are refs 26 (b) and 28 (a). The abstract of (a) states that neurites elongate above one tension threshold and retract below a lower one (web-checked), which would allow a simple threshold model.
- **Cited by:** (a) franze2013mechanics #6; vanessen1997tension #28. (b) vanessen1997tension #26.

---

## Medium priority

These give primary data behind statements the course makes from reviews, or cover topics the course touches only briefly.

### M1. Lu et al. 2006: stiffness of single neurons and glia
- **Reference:** Lu YB, Franze K, Seifert G, Steinhäuser C, Kirchhoff F, Wolburg H, Guck J, Janmey P, Wei EQ, Käs J, Reichenbach A (2006). Viscoelastic properties of individual glial cells and neurons in the CNS. *Proc Natl Acad Sci USA* 103:17759–17764.
- **DOI:** 10.1073/pnas.0606150103 **[DOI web-verified]**.
- **Chapter:** 10 ("How soft is the brain?"), 8.
- **Why:** The course quotes "neurons ~1 kPa, glia ~400 Pa" from Franze 2013 pp. 233–234. Franze cites ref. 63 (this paper) for it. The abstract reports glia about twice as soft as neurons (web-checked).
- **Cited by:** franze2013mechanics #63; pillai2024mechanics #29.

### M2. Elkin et al. 2007: layer-by-layer stiffness of rat hippocampus
- **Reference:** Elkin BS, Azeloglu EU, Costa KD, Morrison B (2007). Mechanical heterogeneity of the rat hippocampus measured by atomic force microscope indentation. *J Neurotrauma* 24:812–822.
- **DOI:** 10.1089/neu.2006.0169 **[DOI in source]** (koser2016mechanosensing).
- **Chapter:** 10, 5 (substrate choice).
- **Why:** Tyler 2012 attributes the rodent hippocampal layer stiffnesses (CA1 stratum pyramidale 0.14 kPa to CA3 stratum radiatum 0.31 kPa) to its ref. 9, which is this paper. The note on tyler2012 flags that the strain and rate conditions are not given there, and this paper would supply them.
- **Cited by:** koser2016mechanosensing #17; pillai2024mechanics #16; tyler2012mechanobiology #9.

### M3. Flanagan et al. 2002: neurite branching on soft substrates
- **Reference:** Flanagan LA, Ju YE, Marg B, Osterfield M, Janmey PA (2002). Neurite branching on deformable substrates. *NeuroReport* 13:2411–2415.
- **DOI:** 10.1097/01.wnr.0000048003.96487.97 **[DOI in source]** (koser2016mechanosensing).
- **Chapter:** 5 ("The substrate"), 12.
- **Why:** This is the most widely cited early study of neurons on gels of controlled stiffness (five course sources cite it). It is the primary source for the idea, used in the culture and frontier chapters, that substrate stiffness changes neuronal morphology. The claims should be read from the paper itself; here only the title is relied on.
- **Cited by:** engler2006matrix (alphabetical); franze2013mechanics #153; koser2016mechanosensing #12; kreysing2025environmental #17; tyler2012mechanobiology #83.

### M4. Georges et al. 2006: brain-soft matrices favour neurons over glia
- **Reference:** Georges PC, Miller WJ, Meaney DF, Sawyer ES, Janmey PA (2006). Matrices with compliance comparable to that of brain tissue select neuronal over glial growth in mixed cortical cultures. *Biophys J* 90:3012–3018.
- **DOI:** 10.1529/biophysj.105.073114 **[DOI in source]** (koser2016mechanosensing).
- **Chapter:** 5 ("The substrate").
- **Why:** This gives a practical, citable reason why a soft substrate changes the neuron:glia ratio in mixed cultures. It is relevant to any lab protocol the student will use.
- **Cited by:** engler2006matrix (alphabetical); franze2013mechanics #38; koser2016mechanosensing #13; pillai2024mechanics #182; thompson2019rapid (also lists it).

### M5. Lo et al. 2000: the original durotaxis paper
- **Reference:** Lo CM, Wang HB, Dembo M, Wang YL (2000). Cell movement is guided by the rigidity of the substrate. *Biophys J* 79:144–152.
- **DOI:** 10.1016/S0006-3495(00)76279-5 **[DOI in source]** (koser2016mechanosensing).
- **Chapter:** 9 ("Mechanical guidance"), 12.
- **Why:** The course defines durotaxis ("non-neuronal cells migrate towards the stiffer side") only through Koser 2016, to contrast it with axons turning toward soft tissue. This is the primary source for durotaxis.
- **Cited by:** engler2006matrix #148; franze2013mechanics #50; koser2016mechanosensing #41.

### M6. Elosegui-Artola et al. 2016: a molecular clutch that senses matrix rigidity
- **Reference:** Elosegui-Artola A, Oria R, Chen Y, Kosmalska A, Pérez-González C, Castro N, Zhu C, Trepat X, Roca-Cusachs P (2016). Mechanical regulation of a molecular clutch defines force transmission and transduction in response to matrix rigidity. *Nat Cell Biol* 18:540–548.
- **DOI:** 10.1038/ncb3336 **[DOI in source]** (pillai2024mechanics).
- **Chapter:** 8 ("The molecular clutch"), 11 ("Two routes from stiffness to the nucleus").
- **Why:** This is a second, more recent quantitative clutch paper alongside Chan & Odde (H3), linking clutch mechanics to talin and to downstream signalling.
- **Cited by:** pillai2024mechanics #58.

### M7. Halder, Dupont & Piccolo 2012 and Elosegui-Artola et al. 2017: YAP/TAZ as the nuclear read-out of stiffness
- **References:**
  - (a) Halder G, Dupont S, Piccolo S (2012). Transduction of mechanical and cytoskeletal cues by YAP and TAZ. *Nat Rev Mol Cell Biol* 13:591–600. **[DOI: not verified]**
  - (b) Elosegui-Artola A, Andreu I, Beedle AEM, et al. (2017). Force triggers YAP nuclear entry by regulating transport across nuclear pores. *Cell* 171:1397–1410.e14. DOI 10.1016/j.cell.2017.10.008 **[DOI in source]** (pillai2024mechanics).
- **Chapter:** 11 ("Two routes from stiffness to the nucleus").
- **Why:** The YAP route in chapter 11 rests on Dupont 2011 alone. (a) is the review that followed it, and (b) gives a physical mechanism (force-dependent nuclear-pore transport) that a biophysicist will find useful.
- **Cited by:** (a) franze2013mechanics #132. (b) pillai2024mechanics #82.

### M8. Swift et al. 2013: lamin-A scales with tissue stiffness
- **Reference:** Swift J, et al. (2013). Nuclear lamin-A scales with tissue stiffness and enhances matrix-directed differentiation. *Science* 341:1240104.
- **DOI:** 10.1126/science.1240104 **[DOI in source]** (koser2016mechanosensing).
- **Chapter:** 11 ("Two routes from stiffness to the nucleus"), 10.
- **Why:** This is a second nuclear mechanosensing route beside YAP, cited by four course sources. Its title gives the claim. Brain, as the softest tissue, sits at the low-lamin end of this scaling (to be checked in the paper).
- **Cited by:** koser2016mechanosensing #37; pathak2014stretch #12; pillai2024mechanics #11; segel2019niche #4.

### M9. Long et al. 2018: ECM components induce folding of human fetal neocortex
- **Reference:** Long KR, Newland B, Florio M, Kalebic N, Langen B, Kolterer A, Wimberger P, Huttner WB (2018). Extracellular matrix components HAPLN1, lumican, and collagen I cause hyaluronic acid-dependent folding of the developing human neocortex. *Neuron* 99:702–719.
- **DOI:** 10.1016/j.neuron.2018.07.013 **[DOI in source]** (long2019extracellular).
- **Chapter:** 6 (line 163), 7 (ECM), 12.
- **Why:** Chapter 6 states that HAPLN1, lumican and collagen I induced folding of 11–16 GW human cortical explants within 24 h, citing the Long & Huttner 2019 review (sec. 4.2). This is the primary paper.
- **Cited by:** long2019extracellular #24; pillai2024mechanics #149; also listed by fawcett2019roles.

### M10. Richman et al. 1975: the first buckling model of cortical folding
- **Reference:** Richman DP, Stewart RM, Hutchinson JW, Caviness VS Jr (1975). Mechanical model of brain convolutional development. *Science* 189:18–21.
- **DOI:** 10.1126/science.1135626 **[DOI: not verified]** (found in only one indexer, Scilit). Volume: Pillai 2024 and web records give 189. Van Essen 1997 prints "188", which looks like a typo.
- **Chapter:** 6, 12.
- **Why:** This is the historical starting point of the differential-growth (buckling) view that Van Essen argued against. Together with H8 it would give a balanced folding section.
- **Cited by:** pillai2024mechanics #135; vanessen1997tension #49.

### M11. Hertz 1882: the original contact-mechanics paper
- **Reference:** Hertz H (1882). Über die Berührung fester elastischer Körper. *J reine angew Math* 92:156–171.
- **DOI:** **[no DOI]**.
- **Chapter:** 10 ("Measuring stiffness: AFM and the Hertz model").
- **Why:** The Hertz model is the central equation of chapter 10 and is cited only through the Methods sections of four papers. Four course sources cite the original. It is in German and of historical value. For a modern derivation, a contact-mechanics textbook would be more useful, but no course source names one.
- **Cited by:** koser2016mechanosensing #56; segel2019niche #22; thompson2019rapid #20; pillai2026long #76 (cited there as the 1882 *Verhandlungen des Vereins zur Beförderung des Gewerbefleißes* version).

### M12. Owens et al. 1996: excitatory GABA in embryonic cortex, measured without disturbing [Cl⁻]ᵢ
- **Reference:** Owens DF, Boyce LH, Davis MB, Kriegstein AR (1996). Excitatory GABA responses in embryonic and neonatal cortical slices demonstrated by gramicidin perforated-patch recordings and calcium imaging. *J Neurosci* 16:6414–6423.
- **DOI:** 10.1523/JNEUROSCI.16-20-06414.1996 **[DOI web-verified]**.
- **Chapter:** 2 ("Why GABA can depolarise", "The NKCC1 → KCC2 switch").
- **Why:** This is the primary measurement that E_GABA becomes more negative with age in embryonic and neonatal cortex (abstract, web-checked). It is a good methods lesson: gramicidin perforated patch leaves internal Cl⁻ intact. Mouse/rat embryonic cortex is the student's own system.
- **Cited by:** benari2002excitatory #13; moody2005ion #468.

### M13. Ben-Ari et al. 1989: giant depolarising potentials
- **Reference:** Ben-Ari Y, Cherubini E, Corradetti R, Gaiarsa JL (1989). Giant synaptic potentials in immature rat CA3 hippocampal neurones. *J Physiol* 416:303–325.
- **DOI:** 10.1113/jphysiol.1989.sp017762 **[DOI web-verified]**. Free full text: PMC1189216.
- **Chapter:** 2 ("Spontaneous activity before synapses mature").
- **Why:** The course discusses giant depolarising potentials through Ben-Ari 2002 and Moody & Bosma 2005. This is the original description (GDPs in >85% of CA3 cells in the first postnatal week, web-checked).
- **Cited by:** benari2002excitatory #1; moody2005ion #35; rivera1999kcc2 #2; spitzer2006electrical #89.

### M14. The GCaMP lineage: Nakai 2001, Tian 2009, Akerboom 2012
- **References:**
  - Nakai J, Ohkura M, Imoto K (2001). A high signal-to-noise Ca²⁺ probe composed of a single green fluorescent protein. *Nat Biotechnol* 19:137–141. DOI 10.1038/84397 **[DOI in source]**.
  - Tian L, et al. (2009). Imaging neural activity in worms, flies and mice with improved GCaMP calcium indicators. *Nat Methods* 6:875–881. DOI 10.1038/nmeth.1398 **[DOI in source]**.
  - Akerboom J, et al. (2012). Optimization of a GCaMP calcium indicator for neural activity imaging. *J Neurosci* 32:13819–13840. DOI 10.1523/JNEUROSCI.2601-12.2012 **[DOI in source]**.
- **Chapter:** 4 ("Genetically encoded calcium indicators"), 3.
- **Why:** The course starts at GCaMP6 (Chen 2013). These papers give the original GCaMP design and the GCaMP3/GCaMP5 steps that Chen 2013 benchmarks against. They are useful for explaining where the K_d, Hill coefficient and kinetics trade-offs come from. Whether they write the Hill equation out must be checked before relying on them for that.
- **Cited by:** chen2013ultrasensitive #17 (Nakai), #11 (Tian), #16 (Akerboom).

### M15. Zhang et al. 2023: jGCaMP8, fast indicators (not cited by any course source)
- **Reference:** Zhang Y, Rózsa M, et al. (2023). Fast and sensitive GCaMP calcium indicators for imaging neural populations. *Nature* 615:884–891.
- **DOI:** 10.1038/s41586-023-05828-9 **[DOI web-verified]**. The full author list differs between online records; take it from the DOI landing page.
- **Chapter:** 4.
- **Why:** The course's newest GECI is GCaMP6 (2013). jGCaMP8 has half-rise times of about 2 ms (web-checked), which would update the "indicator kinetics" comparison in chapter 4 and the times panel in chapter 3.
- **Cited by:** **not cited by any course source.**

### M16. Syeda et al. 2016 and Cox et al. 2016: force-from-lipid gating of Piezo1
- **References:**
  - (a) Syeda R, Florendo MN, Cox CD, Kefauver JM, Santos JS, Martinac B, Patapoutian A (2016). Piezo1 channels are inherently mechanosensitive. *Cell Rep* 17:1739–1746. DOI 10.1016/j.celrep.2016.10.033 **[DOI in source]** (nourse2022piezo).
  - (b) Cox CD, Bae C, Ziegler L, Hartley S, Nikolova-Krstevski V, Rohde PR, Ng CA, Sachs F, Gottlieb PA, Martinac B (2016). Removal of the mechanoprotective influence of the cytoskeleton reveals PIEZO1 is gated by bilayer tension. *Nat Commun* 7:10366. DOI 10.1038/ncomms10366 **[DOI web-verified]**.
- **Chapter:** 11 ("Force from lipid, or from tethers?").
- **Why:** These are the two primary papers behind the "force from lipid" side of the chapter's debate. (b) concludes that PIEZO1 senses force transmitted directly through the bilayer, measured in cytoskeleton-free blebs calibrated with MscL (abstract, web-checked).
- **Cited by:** (a) nourse2022piezo #57. (b) **not cited by any course source** (pillai2024mechanics cites only a 2012 book chapter by Martinac & Cox).

### M17. Goldman 1943 and Hodgkin & Katz 1949: the original GHK equation (not cited by any course source)
- **References:**
  - Goldman DE (1943). Potential, impedance, and rectification in membranes. *J Gen Physiol* 27:37–60. DOI 10.1085/jgp.27.1.37 **[DOI web-verified]**.
  - Hodgkin AL, Katz B (1949). The effect of sodium ions on the electrical activity of the giant axon of the squid. *J Physiol* 108:37–77. DOI 10.1113/jphysiol.1949.sp004310 **[DOI web-verified]**.
- **Chapter:** 1 ("Several ions at once: Goldman–Hodgkin–Katz").
- **Why:** Chapter 1 takes the GHK equation from Fairless 2013, who cites Hille 2001 for it (`fairless2013membrane` ref. 19), and Hille has no text in the course. These are the primary derivations: Goldman's constant-field current equation, and Hodgkin & Katz's voltage equation.
- **Cited by:** **not cited by any course source.**

### M18. Hill 1910 and Weiss 1997: the Hill equation (not cited by any course source)
- **References:**
  - Hill AV (1910). The possible effects of the aggregation of the molecules of haemoglobin on its dissociation curves. *J Physiol* 40 (Proceedings):iv–vii. **[no DOI]** (one catalogue gives the pages as 4–7).
  - Weiss JN (1997). The Hill equation revisited: uses and misuses. *FASEB J* 11:835–841. DOI 10.1096/fasebj.11.11.9285481 **[DOI web-verified]** (from a citing reference list).
- **Chapter:** 4 (GCaMP6 K_d and Hill coefficients), 3.
- **Why:** Chen 2013 reports Hill coefficients (2.27–2.96) but never writes the equation. Hill 1910 is the historical origin. Weiss 1997 is a short modern account of what the Hill coefficient does and does not mean, which a biophysics student will find more useful.
- **Cited by:** **not cited by any course source.**

### M19. Bae, Sachs & Gottlieb 2011: GsMTx4 inhibits Piezo1
- **Reference:** Bae C, Sachs F, Gottlieb PA (2011). The mechanosensitive ion channel Piezo1 is inhibited by the peptide GsMTx4. *Biochemistry* 50:6295–6300.
- **DOI:** 10.1021/bi200770q **[DOI in source]** (pathak2014stretch).
- **Chapter:** 11 ("Tools to activate and block Piezo1").
- **Why:** Chapter 11 discusses GsMTx4, citing Pillai 2024 and Pathak 2014, and asks the reader what controls they would demand. This is the primary characterisation of the blocker.
- **Cited by:** pathak2014stretch #35; syeda2015chemical #4.

---

## Low priority

These are useful background or updates, but no current statement in the course depends on them.

### L1. Hamill & Martinac 2001: review of mechanotransduction and MS channels
- **Reference:** Hamill OP, Martinac B (2001). Molecular basis of mechanotransduction in living cells. *Physiol Rev* 81:685–740.
- **DOI:** 10.1152/physrev.2001.81.2.685 **[DOI in source]** (coste2010piezo).
- **Chapter:** 11 ("Mechanosensitive channels").
- **Why:** This is a standard review of mechanosensitive channels and their gating, and the first reference in both Coste 2010 and Tyler 2012. I have not checked whether it writes out the two-state Boltzmann model, so use H2 for the equation.
- **Cited by:** coste2010piezo #2; tyler2012mechanobiology #1.

### L2. Hamill et al. 1981: the patch-clamp paper
- **Reference:** Hamill OP, Marty A, Neher E, Sakmann B, Sigworth FJ (1981). Improved patch-clamp techniques for high-resolution current recording from cells and cell-free membrane patches. *Pflügers Arch* 391:85–100.
- **DOI:** 10.1007/BF00656997 **[DOI web-verified]**.
- **Chapter:** 1 ("Currents and the voltage clamp"), 11 (cell-attached vs whole-cell stimulation).
- **Why:** It is the original source for the giga-seal, cell-attached, inside-out and outside-out configurations that the Piezo1 chapter relies on.
- **Cited by:** baxter2002novel #6.

### L3. Garaschuk et al. 2000: calcium waves in the immature cortex
- **Reference:** Garaschuk O, Linn J, Eilers J, Konnerth A (2000). Large-scale oscillatory calcium waves in the immature cortex. *Nat Neurosci* 3:452–459.
- **DOI:** 10.1038/74823 **[DOI web-verified]**. The author order varies between online catalogues. The order above is the one printed by benari2002excitatory.
- **Chapter:** 2, 3.
- **Why:** These are primary data on spontaneous network activity in newborn cortex and its end with the GABA switch (abstract, web-checked).
- **Cited by:** benari2002excitatory #80; moody2005ion #195; spitzer2006electrical #87.

### L4. Gomez & Zheng 2006: calcium in axon pathfinding
- **Reference:** Gomez TM, Zheng JQ (2006). The molecular basis for calcium-dependent axon pathfinding. *Nat Rev Neurosci* 7:115–125.
- **DOI:** 10.1038/nrn1844 **[DOI web-verified]**.
- **Chapter:** 3 ("Calcium in the growth cone"), 9 ("Inside the growth cone").
- **Why:** This is a focused review that links chapters 3 and 9, and it is more recent and more specific than Spitzer 2006 on this point.
- **Cited by:** franze2013mechanics #129; rosenberg2011calcium #15.

### L5. Takahashi, Nowakowski & Caviness 1995: cell-cycle timing in the mouse ventricular zone
- **Reference:** Takahashi T, Nowakowski RS, Caviness VS Jr (1995). The cell cycle of the pseudostratified ventricular epithelium of the embryonic murine cerebral wall. *J Neurosci* 15:6046–6057.
- **DOI:** 10.1523/JNEUROSCI.15-09-06046.1995 **[DOI web-verified]**.
- **Chapter:** 6 ("The neuroepithelium and its progenitors", timeline).
- **Why:** The anatomy chapter has few hard numbers for mouse neurogenesis. This paper gives cell-cycle lengths from E11 to E17 (8.1 to 18.4 h, mainly through G1 lengthening; abstract, web-checked). Götz & Huttner 2005 annotates the companion work as seminal.
- **Cited by:** gotz2005cell #129; moody2005ion #578.

### L6. Sack et al. 2009: brain softening with age (MRE)
- **Reference:** Sack I, Beierbach B, Wuerfel J, Klatt D, Hamhaber U, Papazoglou S, Martus P, Braun J (2009). The impact of aging and gender on brain viscoelasticity. *NeuroImage* 46:652–657.
- **DOI:** 10.1016/j.neuroimage.2009.02.040 **[DOI web-verified]**.
- **Chapter:** 10 ("Brain stiffens through development, then softens again from ~40 years in humans").
- **Why:** Pillai & Franze 2024 give ref. 27 (this paper) for the human figure that the course quotes. For the mouse figure (~10 months), they cite Ryu et al. 2021 (pillai2024mechanics #26, *Front Aging Neurosci* 13:709620), which could be added too.
- **Cited by:** pillai2024mechanics #27.

### L7. Saotome et al. 2018: cryo-EM structure of Piezo1 (not cited by any course source)
- **Reference:** Saotome K, Murthy SE, Kefauver JM, Whitwam T, Patapoutian A, Ward AB (2018). Structure of the mechanically activated ion channel Piezo1. *Nature* 554:481–486.
- **DOI:** 10.1038/nature25453 **[DOI web-verified]**. Companion paper in the same issue: Zhao Q, et al. (2018). Structure and mechanogating mechanism of the Piezo1 channel. *Nature* 554:487–492, DOI 10.1038/nature25743 (DOI as reported by the same search; not separately checked).
- **Chapter:** 11.
- **Why:** The course has no Piezo structure: the three-bladed propeller, the central pore, and the beam/anchor domains that probably transmit force to the gate. These are needed to discuss *how* membrane tension could open the channel.
- **Cited by:** **not cited by any course source.**

### L8. Tallinen et al. 2016 and Karzbrun et al. 2018: folding in gels and in organoids (not cited by any course source)
- **References:**
  - Tallinen T, Chung JY, Rousseau F, Girard N, Lefèvre J, Mahadevan L (2016). On the growth and form of cortical convolutions. *Nat Phys* 12:588–593. DOI 10.1038/nphys3632 **[DOI web-verified]**.
  - Karzbrun E, Kshirsagar A, Cohen SR, Hanna JH, Reiner O (2018). Human brain organoids on a chip reveal the physics of folding. *Nat Phys* 14:515–522. DOI 10.1038/s41567-018-0046-7 **[DOI web-verified]**.
- **Chapter:** 6, 12.
- **Why:** Tallinen 2016 shows folding in a 3D-printed swelling-gel brain and in simulations. Karzbrun 2018 shows wrinkling in organoids, driven by cytoskeletal contraction at the core and nuclear expansion at the edge, with fewer folds in lissencephaly-model organoids (abstracts, web-checked). Together they connect the folding and organoid gaps (H8, H9).
- **Cited by:** **not cited by any course source.**

### L9. Bray 1984 and Lamoureux et al. 1989: classic axon-tension experiments
- **References:**
  - Bray D (1984). Axonal growth in response to experimentally applied mechanical tension. *Dev Biol* 102:379–389. DOI 10.1016/0012-1606(84)90202-1 **[DOI web-verified]**.
  - Lamoureux P, Buxbaum RE, Heidemann SR (1989). Direct evidence that growth cones pull. *Nature* 340:159–162. DOI 10.1038/340159a0 **[DOI web-verified]**.
- **Chapter:** 8 ("Tension and towed growth", "How large are the forces?").
- **Why:** These are the founding experiments of axon mechanics: axons elongate under applied tension, and growth cones pull on the neurite. They complement H11.
- **Cited by:** Bray 1984: mitchison1988cytoskeletal (alphabetical); pillai2024mechanics #122; tyler2012mechanobiology #89. Lamoureux 1989: pillai2024mechanics #2; vanessen1997tension #24.

### L10. Ranade et al. 2014: Piezo1 is required for vascular development in mice
- **Reference:** Ranade SS, et al. (2014). Piezo1, a mechanically activated ion channel, is required for vascular development in mice. *Proc Natl Acad Sci USA* 111:10347–10352.
- **DOI:** 10.1073/pnas.1409233111 **[DOI in source]** (pathak2014stretch).
- **Chapter:** 12 ("Piezo1 beyond sensing"), 11.
- **Why:** Chapter 12 discusses constitutive *Piezo1* knockout embryos at E10.5 (Nourse 2022). This paper is the knockout characterisation that three course sources cite. It helps explain why embryonic stages after mid-gestation cannot be studied in global knockouts.
- **Cited by:** nourse2022piezo #42; pathak2014stretch #34; syeda2015chemical #23.

---

## Summary table

| ID | Short reference | Gap or claim | Chapter | Course sources citing it | DOI status |
|---|---|---|---|---|---|
| H1 | Hodgkin & Huxley 1952 | HH equations, simulator | 1 | (bib entry, no text); fairless cites the 1952 currents paper | web-verified |
| H2 | Lewis & Grandl 2015 | Boltzmann equation, T50 | 11 | 2 | in source |
| H3 | Chan & Odde 2008 | quantitative clutch | 8 | 3 | in source |
| H4 | Iwashita 2014 | embryonic mouse brain stiffness | 6, 10, 12 | 5 | in source |
| H5 | Koch 2012 | 537 / 71 pN traction | 8 | 5 | in source |
| H6 | Betz 2011 | ~30 Pa growth-cone stress | 8 | 3 | in source |
| H7 | Elkin 2010 | strain stiffening 150–300 → >2,000 Pa | 10 | 4 | in source |
| H8 | Tallinen 2014 | folding model | 6, 12 | 1 | in source |
| H9 | Lancaster 2013 | organoids | 5, 12 | 1 | in source |
| H10 | Coste 2012 | Piezo is the pore | 11 | 4 | in source |
| H11 | Dennerll 1989; Lamoureux 1992 | towed growth, 150 µdyn | 8 | 2; 1 | web-verified |
| M1 | Lu 2006 | neuron/glia stiffness | 10 | 2 | web-verified |
| M2 | Elkin 2007 | hippocampal layers | 10 | 3 | in source |
| M3 | Flanagan 2002 | neurites on soft gels | 5 | 5 | in source |
| M4 | Georges 2006 | soft gels select neurons | 5 | 5 | in source |
| M5 | Lo 2000 | durotaxis | 9, 12 | 3 | in source |
| M6 | Elosegui-Artola 2016 | rigidity-sensing clutch | 8, 11 | 1 | in source |
| M7 | Halder 2012; Elosegui-Artola 2017 | YAP/TAZ | 11 | 1; 1 | not verified; in source |
| M8 | Swift 2013 | lamin-A | 11 | 4 | in source |
| M9 | Long 2018 | ECM-induced folding | 6, 7 | 3 | in source |
| M10 | Richman 1975 | buckling model | 6, 12 | 2 | not verified |
| M11 | Hertz 1882 | Hertz model | 10 | 4 | no DOI |
| M12 | Owens 1996 | E_GABA in embryonic cortex | 2 | 2 | web-verified |
| M13 | Ben-Ari 1989 | GDPs | 2 | 4 | web-verified |
| M14 | Nakai 2001; Tian 2009; Akerboom 2012 | GCaMP lineage | 4 | 1 each | in source |
| M15 | Zhang 2023 | jGCaMP8 | 4 | none | web-verified |
| M16 | Syeda 2016; Cox 2016 | force from lipid | 11 | 1; none | in source; web-verified |
| M17 | Goldman 1943; Hodgkin & Katz 1949 | GHK originals | 1 | none | web-verified |
| M18 | Hill 1910; Weiss 1997 | Hill equation | 4 | none | no DOI; web-verified |
| M19 | Bae 2011 | GsMTx4 | 11 | 2 | in source |
| L1 | Hamill & Martinac 2001 | MS channel review | 11 | 2 | in source |
| L2 | Hamill 1981 | patch clamp | 1, 11 | 1 | web-verified |
| L3 | Garaschuk 2000 | cortical Ca²⁺ waves | 2, 3 | 3 | web-verified |
| L4 | Gomez & Zheng 2006 | Ca²⁺ and pathfinding | 3, 9 | 2 | web-verified |
| L5 | Takahashi 1995 | VZ cell cycle | 6 | 2 | web-verified |
| L6 | Sack 2009 | ageing softening | 10 | 1 | web-verified |
| L7 | Saotome 2018 (+ Zhao 2018) | Piezo1 structure | 11 | none | web-verified |
| L8 | Tallinen 2016; Karzbrun 2018 | folding in gels and organoids | 6, 12 | none | web-verified |
| L9 | Bray 1984; Lamoureux 1989 | classic tension experiments | 8 | 3; 2 | web-verified |
| L10 | Ranade 2014 | Piezo1 knockout | 11, 12 | 3 | in source |

**DOI tally (50 papers in 40 entries).** 24 DOIs printed in a course source. 21 DOIs web-verified. 3 not verified: Halder 2012, Richman 1975 (one indexer only) and Zhao 2018 (search-reported only). 2 have no DOI: Hertz 1882 and Hill 1910.

---

## Method notes and limitations

- **Reference lists come from extracted text.** Reference lists were read from the markdown full texts in `sources/markdown/`, using the part after the last "References"/"Literature cited" heading (or the last ~40% of the file when there was no heading). OCR quality is poor for the older scanned papers (mitchison1988cytoskeletal, vanessen1997tension, dotti1988establishment, craig1994neuronal), and some lists (berridge2003calcium, coste2010piezo, baxter2002novel) were captured only in part. A few citations may therefore have been missed, and "cited by" counts are lower bounds.
- **Reference numbers** were found automatically and spot-checked by hand. Treat them as a guide for finding the entry, not as checked page references.
- **Content claims.** Where an entry says what a paper shows, the claim comes from (i) how a course source cites it, (ii) its title, or (iii) its abstract or figure legends as seen in a web search (marked "web-checked"). None of the proposed papers was read in full. Before any number from them goes into the course, the paper itself should be read, with notes written in `notes/<citekey>.md` as was done for the existing sources.
- **Topics with no course source.** Some topics have no citing course source: Piezo structure, jGCaMP8, Hill and GHK originals, Cox 2016, Tallinen 2016 and Karzbrun 2018. For these I proposed well-known works and marked them "not cited by any course source". They are suggestions only, not the result of the citation analysis.
- **Bibliographic disagreements.** Minor disagreements between sources are noted where seen: the Richman 1975 volume (188 vs 189), the Elkin 2010 year (2009 vs 2010), the Garaschuk 2000 author order, and the Zhang 2023 author list. Check the publisher record before adding a bib entry.
- **What was searched for and not found.** No course source cites a primary paper for: Hodgkin–Huxley (the quantitative paper), the Goldman or Hodgkin–Katz derivations, the Hill equation, Piezo1 structures, durotaxis in neurons, or Tallinen 2016. No course source writes out a Boltzmann open-probability equation in its own text; Lewis & Grandl 2015 (H2) does, according to a web check of its figure legends.
