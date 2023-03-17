
export  const  commentMRD = `* Clonal IGH read depth를 전체 IGH read depth로 나눈 값으로 B 세포 중의 클론의 비율을 의미합니다.\n
** LymphoQuant Internal Control (LQIC)을 이용하여 clonal IGH를 전체 유핵세포 내의 세포수 비율로 환산한 근사치입니다.\n
*** 검체 당 B 세포 100개 정도의 DNA(LymphoQuant Internal Control, LQIC)를 혼합하여 측정된 값을 변환한 것입니다.\n
  - PCR 증폭은 B 세포의 DNA양에 영향을 받으며 primer결합 부위 변이가 있는 경우 위음성을 보일 가능성이 있습니다.
  - 검사의 분석 민감도는 약  10<sup>-4</sup> ~ 10<sup>-5</sup>입니다.`;


  export function makeComment(geneType: string, testCode: string) {
    let BTtype = '';
    if(testCode === 'LPE555' || testCode === 'LPE556') {
        BTtype = 'B';
    } else if (testCode === 'LPE557') {
        BTtype = 'T';
    }

    return `* Clonal ${geneType} read depth를 전체 ${geneType} read depth로 나눈 값으로 ${BTtype} 세포 중의 클론의 비율을 의미합니다.
**   LymphoQuant Internal Control (LQIC)을 이용하여 clonal IGH를 전체 유핵세포 내의 세포수 비율로 환산한 근사치입니다.
*** 검체 당 ${BTtype} 세포 100개 정도의 DNA(LymphoQuant Internal Control, LQIC)를 혼합하여 측정된 값을 변환한 것입니다.
      - PCR 증폭은 ${BTtype} 세포의 DNA양에 영향을 받으며 primer결합 부위 변이가 있는 경우 위음성을 보일 가능성이 있습니다.
      - 검사의 분석 민감도는 약  10⁻⁴ ~ 10⁻⁵ 입니다.`;

//       return `* Clonal ${geneType} read depth를 전체 ${geneType} read depth로 나눈 값으로 ${BTtype} 세포 중의 클론의 비율을 의미합니다.
// ** 검체 당 ${BTtype} 세포 100개 정도의 DNA(LymphoQuant Internal Control, LQIC)를 혼합하여 측정된 값을 변환한 것입니다. 
//     - 클론성 염기서열은 검체 내 전체 read depath가 20,000 이상이면서 전체 read depth 중 최소 ≥2.5% 이상, 혹은 전체 read 
//       depath가 10,000 이상이면서 전체 read depth 중 최소 ≥5.0% 이상인 dominant sequence 로 판정합니다.
//     - PCR 증폭은 ${BTtype} 세포의 DNA양에 영향을 받으며 primer결합 부위 변이가 있는 경우 위음성을 보일 가능성이 있습니다.
//       `;
    
  }

  export function initalComment(geneType: string, testCode: string) {
    let BTtype = '';
    if(testCode === 'LPE555' || testCode === 'LPE556') {
        BTtype = 'B';
    } else if (testCode === 'LPE557') {
        BTtype = 'T';
    }

//     return `* Clonal ${geneType} read depth를 전체 ${geneType} read depth로 나눈 값으로 ${BTtype} 세포 중의 클론의 비율을 의미합니다.
// **   LymphoQuant Internal Control (LQIC)을 이용하여 clonal IGH를 전체 유핵세포 내의 세포수 비율로 환산한 근사치입니다.
// *** 검체 당 ${BTtype} 세포 100개 정도의 DNA(LymphoQuant Internal Control, LQIC)를 혼합하여 측정된 값을 변환한 것입니다.
//       - PCR 증폭은 ${BTtype} 세포의 DNA양에 영향을 받으며 primer결합 부위 변이가 있는 경우 위음성을 보일 가능성이 있습니다.
//       - 검사의 분석 민감도는 약  10⁻⁴ ~ 10⁻⁵ 입니다.`;

      return `* Clonal ${geneType} read depth를 전체 ${geneType} read depth로 나눈 값으로 ${BTtype} 세포 중의 클론의 비율을 의미합니다.
** 검체 당 ${BTtype} 세포 100개 정도의 DNA(LymphoQuant Internal Control, LQIC)를 혼합하여 측정된 값을 변환한 것입니다. 
    - 클론성 염기서열은 검체 내 전체 read depath가 20,000 이상이면서 전체 read depth 중 최소 ≥2.5% 이상, 혹은 전체 read 
      depath가 10,000 이상이면서 전체 read depth 중 최소 ≥5.0% 이상인 dominant sequence 로 판정합니다.
    - PCR 증폭은 ${BTtype} 세포의 DNA양에 영향을 받으며 primer결합 부위 변이가 있는 경우 위음성을 보일 가능성이 있습니다.
      `;
  }



  export function initialTestResult(geneType: string, clonalCountTitle: string) {

    return `미세잔존질환(MRD) 추적에 적합한 ${geneType} 클론이 ${clonalCountTitle} 개 검출됩니다.`;
  }
