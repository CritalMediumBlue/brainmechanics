# Provenance of the embryonic mouse brain meshes

Anatomical geometry from the DevCCF v1 (Developmental Mouse Brain Common Coordinate Framework); not from the course's literature PDFs.

## Source dataset

| Item | Value |
|---|---|
| Dataset | DevCCFv1: Developmental Mouse Brain Common Coordinate Framework, version 1 (figshare version 1, published 2024-08-05) |
| Dataset DOI | <https://doi.org/10.6084/m9.figshare.26377171.v1> |
| Landing page | <https://figshare.com/articles/dataset/DevCCFv1/26377171> (linked from <https://kimlab.io/brain-map/DevCCF/>, which redirects to <https://kimlab.io/home/projects/DevCCF/index.html>) |
| Paper | Kronman FN, Liwang JK, Betty R, Vanselow DJ, Wu YT, Tustison NJ, et al., Kim Y. Developmental mouse brain common coordinate framework. *Nature Communications* 15, 9072 (2024). <https://doi.org/10.1038/s41467-024-53254-w> |
| Licence | Creative Commons Attribution 4.0 International (CC BY 4.0), <https://creativecommons.org/licenses/by/4.0/> (legal code: <https://creativecommons.org/licenses/by/4.0/legalcode>). Stated in the figshare record metadata and in `DevCCFv1_ReadMe.md` ("LICENSE" and "CONDITIONS FOR USE"). |
| Producer | Yongsoo Kim lab (Penn State); a BRAIN Initiative Cell Census Network (BICCN) resource |

Files used (downloaded 2026-11-27 from `https://ndownloader.figshare.com/files/<id>`; MD5 checked against the figshare API):

| figshare file | id | MD5 | Member used |
|---|---|---|---|
| E11.5.zip | 48169828 | c447b34c58c3303354119513a451d135 | `E11.5/E11-5_DevCCF_Annotations_31.5um.nii.gz` |
| E13.5.zip | 48169831 | 7c8a2d332539ad940b3f709a3ff2a22b | `E13.5/E13-5_DevCCF_Annotations_34um.nii.gz` |
| E15.5.zip | 48169834 | 0efdb5abf63757a0c0c973c9ec9c59ca | `E15.5/E15-5_DevCCF_Annotations_37.5um.nii.gz` |
| E18.5.zip | 48169837 | a9e44a9abab3f097bf547155688888f1 | `E18.5/E18-5_DevCCF_Annotations_40um.nii.gz` |
| DevCCFv1_OntologyStructure.xlsx | 48169825 | 91c948371bc4a3ca35610edb65d31f8a | ontology (IDs, acronyms, names, structure paths) |
| DevCCFv1_ReadMe.md | 48169873 | c11a4e1ad8b06477a8417a995cc084a9 | licence, conditions, citation |

The annotation volumes at the MRI template resolution (31.5, 34, 37.5 and 40 µm isotropic) were used. Each zip also contains a 20 µm annotation file covering the same physical extent.

## Required attribution

The dataset asks users to cite both the paper and the dataset. It also requires users to cite and acknowledge the BICCN and the producing laboratory in any tools, web applications, presentations and publications. Text to show with the viewer:

> Brain region meshes derived from the Developmental Mouse Brain Common Coordinate Framework (DevCCF v1): Kronman FN et al., "Developmental mouse brain common coordinate framework", *Nature Communications* 15, 9072 (2024), doi:10.1038/s41467-024-53254-w; dataset: Nova F, Kim Y (2024), DevCCFv1, figshare, doi:10.6084/m9.figshare.26377171.v1. DevCCF is a BRAIN Initiative Cell Census Network (BICCN) resource from the Kim Lab, Penn State. Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Changes: atlas labels grouped into seven regions and converted to smoothed, simplified surface meshes.

## Processing

The tools were Node 22 with nifti-reader-js 0.8.1, xlsx 0.18.5, yauzl 3.4.0, meshoptimizer 1.3.0 and @gltf-transform/core 4.5.1. Surface extraction and smoothing used code written for this course. No Python was used.

1. **Reading the data.** Each annotation NIfTI was read as float32 labels. The header units are mm, and qform and sform are both 1. Its affine maps voxel (i, j, k) to world (x, y, z) = (s·i, s·k, −s·j). The world frame is taken as RAS (+x right, +y anterior, +z superior/dorsal). This was checked against the data: region centroids are symmetric about the x mid-plane, the pallium has the highest y and the hindbrain the lowest, and the midbrain has the highest z and the hypothalamus the lowest.
2. **Grouping.** Every fine label was assigned to a group by its ancestors in the DevCCFv1 ontology (column "Structure ID Path16"). The first matching group in this order wins:
   - pallium: `Pall` (pallium) and `TelR` (roof plate of the evaginated telencephalic vesicle)
   - subpallium: `SPall`
   - hypothalamus and preoptic area: `PHy` (peduncular hypothalamus), `THy` (terminal hypothalamus) and `POTel` (preoptic telencephalon; the ontology places it under hypothalamic prosomere hp2)
   - diencephalon: `D` (prosomeres p1–p3)
   - midbrain: `M` (m1–m2)
   - hindbrain: `H` (r0–r11, which includes the cerebellar anlage in r1)
   - ventricles: `ventricles` (21558)

   Not meshed: spinal cord labels (`SpR`, `SpA`, `SpB`, `SpF`), and 159 voxels at E13.5 labelled only with the root `NP` (neural plate). The full label-to-group table is in `atlas-groups.json` under `labels`.
3. **Central canal trim.** Ventricle voxels whose nearest tissue voxel is spinal cord were removed, using a 6-connected breadth-first search from all tissue voxels. This trimmed 1,938 voxels at E11.5 and none at the other ages. It stops a tube of central canal from protruding behind the hindbrain.
4. **Surface extraction.** For each group, the binary mask was cropped with 4 voxels of padding and blurred with a Gaussian (σ = 0.75 voxel). The surface was then extracted by naive surface nets at iso = 0.4, which keeps one-voxel-thin roof plates. Outward winding was checked by signed volume.
5. **Cleanup.** Connected components smaller than 0.5 % of a group's triangles, or smaller than 60 triangles, were discarded as stray voxels. Then 4 iterations of Taubin smoothing were applied (λ = 0.5, μ = −0.53).
6. **Units and axes.** Vertices were converted to micrometres and the axes permuted to the glTF frame +x = anterior, +y = dorsal, +z = right (right-handed). Each age was centred on the centre of its bounding box; the offsets are in `atlas-groups.json`.
7. **Decimation.** meshoptimizer `simplify` reduced each age to about 60,000 triangles, split between groups in proportion to their extracted triangle counts, with at least 1,500 per group. The relative simplification error was ≤ 0.004 for every mesh.
8. **Export.** Plain binary glTF, one file per age, with one named node and mesh per group (`pallium`, `subpallium`, `hypothalamus`, `diencephalon`, `midbrain`, `hindbrain`, `ventricles`). Each file has float32 POSITION and NORMAL, uint16 indices, and a material in the group colour. There is no Draco or other compression extension, so the r0.130 GLTFLoader needs no extra decoder.

## Outputs

| File | Bytes | Vertices | Triangles | Bounding box A × D × LR (µm) | SHA-256 |
|---|---|---|---|---|---|
| E11.5.glb | 1,083,404 | 29,864 | 59,996 | 4149 × 3532 × 2184 | 1e49004d… |
| E13.5.glb | 1,083,160 | 29,859 | 59,978 | 5734 × 3616 × 2889 | ec7ced3f… |
| E15.5.glb | 1,058,364 | 28,895 | 59,702 | 6722 × 3650 × 4814 | 3c0ed60f… |
| E18.5.glb | 1,057,108 | 28,783 | 59,940 | 7910 × 4415 × 5852 | d9eea388… |

Total: 4.28 MB (4.08 MiB). Every file parses with @gltf-transform/core and with the three r0.130 classic `GLTFLoader`.

## Caveats

- Each age is its own template space, built from several specimens. Sizes are comparable between ages, but positions are not.
- Left and right follow the NIfTI RAS convention of the source; the templates are symmetric.
- At E11.5 the roof of the fourth ventricle is very thin and mostly unlabelled, so the ventricle mesh shows through the dorsal hindbrain. Small perforations remain along the hindbrain and midbrain roof plates.
- The meshes are smoothed and simplified, so they are not suitable for volumetric measurement; use the source volumes for that.
- Groups touch along shared boundaries. Because the iso level is 0.4, neighbouring surfaces overlap by a few micrometres.
