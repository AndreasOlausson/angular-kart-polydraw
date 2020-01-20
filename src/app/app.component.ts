import { Component } from "@angular/core";
import { MapHelperService } from "./map/map-helper.service";
import { ILatLng } from "./map/polygon-helpers";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  name = "Angular";

  pn0254: ILatLng[][] = [
    [
      { lat: 59.9137669995347, lng: 10.716912 },
      { lat: 59.9119439995347, lng: 10.718086 },
      { lat: 59.9122099995347, lng: 10.719407 },
      { lat: 59.9119269995347, lng: 10.721145 },
      { lat: 59.9123129995347, lng: 10.722227 },
      { lat: 59.9121599995347, lng: 10.722759 },
      { lat: 59.9118759995347, lng: 10.722396 },
      { lat: 59.9117869995347, lng: 10.72365 },
      { lat: 59.9124999995347, lng: 10.723694 },
      { lat: 59.9122829995347, lng: 10.724347 },
      { lat: 59.9128319995347, lng: 10.725652 },
      { lat: 59.9132499995347, lng: 10.723503 },
      { lat: 59.9134449995347, lng: 10.723672 },
      { lat: 59.9140599995347, lng: 10.722228 },
      { lat: 59.9145049995347, lng: 10.723162 },
      { lat: 59.9152129995348, lng: 10.722434 },
      { lat: 59.9148489995347, lng: 10.720304 },
      { lat: 59.9145679995347, lng: 10.720726 },
      { lat: 59.9141289995347, lng: 10.719708 },
      { lat: 59.9144329995347, lng: 10.718779 },
      { lat: 59.9142809995348, lng: 10.718283 },
      { lat: 59.9139759995347, lng: 10.718653 },
      { lat: 59.9137669995347, lng: 10.716912 }
    ],
    [
      { lat: 59.9132319995347, lng: 10.722003 },
      { lat: 59.9134349995347, lng: 10.721425 },
      { lat: 59.9136029995347, lng: 10.721683 },
      { lat: 59.9130309995347, lng: 10.723528 },
      { lat: 59.9124709995347, lng: 10.723031 },
      { lat: 59.9125529995347, lng: 10.721881 },
      { lat: 59.9132319995347, lng: 10.722003 }
    ]
  ];

  pn0252: ILatLng[][] = [
    [
      { lat: 59.90128599953461, lng: 10.715012999999999 },
      { lat: 59.90605499953466, lng: 10.716393 },
      { lat: 59.90772399953467, lng: 10.718193 },
      { lat: 59.90946199953467, lng: 10.722602999999998 },
      { lat: 59.909975999534694, lng: 10.722030999999998 },
      { lat: 59.91037899953471, lng: 10.723245000000004 },
      { lat: 59.906482999534646, lng: 10.724845000000002 },
      { lat: 59.90192499953463, lng: 10.721306000000002 },
      { lat: 59.90128599953461, lng: 10.715012999999999 }
    ]
  ];
  pn0253: ILatLng[][] = [
    [
      { lat: 59.9112809995347, lng: 10.720321999999998 },
      { lat: 59.91171999953472, lng: 10.720544 },
      { lat: 59.911641999534716, lng: 10.723379000000001 },
      { lat: 59.9117679995347, lng: 10.723480000000002 },
      { lat: 59.91184499953473, lng: 10.721888 },
      { lat: 59.912069999534715, lng: 10.721374000000003 },
      { lat: 59.912262999534725, lng: 10.721598000000002 },
      { lat: 59.91213999953472, lng: 10.721990000000002 },
      { lat: 59.9123129995347, lng: 10.722227 },
      { lat: 59.91215999953473, lng: 10.722759000000002 },
      { lat: 59.9118759995347, lng: 10.722396 },
      { lat: 59.911786999534705, lng: 10.72365 },
      { lat: 59.911580999534706, lng: 10.723459 },
      { lat: 59.91165499953472, lng: 10.722184000000002 },
      { lat: 59.91113099953468, lng: 10.722066000000002 },
      { lat: 59.9112809995347, lng: 10.720321999999998 }
    ],
    [
      { lat: 59.91343499953473, lng: 10.721424999999998 },
      { lat: 59.913602999534724, lng: 10.721683 },
      { lat: 59.913030999534726, lng: 10.723528000000002 },
      { lat: 59.912470999534726, lng: 10.723031 },
      { lat: 59.912536999534716, lng: 10.722772000000003 },
      { lat: 59.91236699953473, lng: 10.722519000000002 },
      { lat: 59.91255299953473, lng: 10.721880999999998 },
      { lat: 59.91275899953473, lng: 10.722159999999999 },
      { lat: 59.91295899953471, lng: 10.721596 },
      { lat: 59.913231999534716, lng: 10.722003 },
      { lat: 59.91343499953473, lng: 10.721424999999998 }
    ],
    [
      { lat: 59.914059999534736, lng: 10.722228000000001 },
      { lat: 59.91450499953475, lng: 10.723161999999999 },
      { lat: 59.91488299953473, lng: 10.722514 },
      { lat: 59.91506199953474, lng: 10.722853 },
      { lat: 59.91463499953472, lng: 10.723891 },
      { lat: 59.91512799953473, lng: 10.724659 },
      { lat: 59.91495399953473, lng: 10.725907 },
      { lat: 59.91519099953475, lng: 10.726231 },
      { lat: 59.915136999534745, lng: 10.726750000000001 },
      { lat: 59.91479399953474, lng: 10.727636999999996 },
      { lat: 59.914208999534736, lng: 10.726809 },
      { lat: 59.91433099953474, lng: 10.726432 },
      { lat: 59.91371499953473, lng: 10.725579999999999 },
      { lat: 59.913596999534725, lng: 10.725832 },
      { lat: 59.913272999534726, lng: 10.725498 },
      { lat: 59.91306499953472, lng: 10.725956 },
      { lat: 59.912831999534724, lng: 10.725652000000002 },
      { lat: 59.913220999534715, lng: 10.724587999999999 },
      { lat: 59.91324999953473, lng: 10.723502999999997 },
      { lat: 59.91344499953475, lng: 10.723672000000002 },
      { lat: 59.914059999534736, lng: 10.722228000000001 }
    ]
  ];

  homansbyen: ILatLng[][] = [
    [
      {lat: 59.923856980873936, lng: 10.716666358724478},
       {lat: 59.92503291743531, lng: 10.717809979918782},
       {lat: 59.92898204341424, lng: 10.726612840084913},
       {lat: 59.92553505967488, lng: 10.73081000540787},
       {lat: 59.92120857646666, lng: 10.732596444866198},
       {lat: 59.92007735898484, lng: 10.73536681137},
       {lat: 59.91728146232324, lng: 10.732162703067074},
       {lat: 59.91872314511897, lng: 10.731608888171255},
       {lat: 59.91906334379838, lng: 10.730897463821027},
       {lat: 59.9203110946203, lng: 10.727894411679614},
       {lat: 59.919826467815064, lng: 10.727161251301162},
       {lat: 59.92028213379621, lng: 10.72583328175604},
       {lat: 59.92368739893148, lng: 10.719453160886356},
       {lat: 59.923856980873936, lng: 10.716666358724478}
  ]]

  viken = {
      
        type: "Feature",
        id: "Q56407178",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [7.4388425, 60.6600393017386],
                [7.546318, 60.6574044017384],
                [7.6358508, 60.6329069017362],
                [7.6217137, 60.5961453017326],
                [7.6395769, 60.5595877017285],
                [7.6731796, 60.5373877017259],
                [7.7321147, 60.5209704017239],
                [7.6940284, 60.4263561017107],
                [7.6737091, 60.2943347016883],
                [7.609752, 60.2440945016786],
                [7.5830639, 60.1757199016642],
                [7.4882618, 60.0989292016468],
                [7.6460006, 60.1268519016533],
                [7.7646652, 60.1159344016508],
                [7.8128406, 60.1026510016477],
                [7.9209522, 60.1371442016557],
                [8.0576701, 60.1635862016616],
                [8.1031846, 60.183530401666],
                [8.1323472, 60.1856278016664],
                [8.1538054, 60.1846069016662],
                [8.1703827, 60.1737504016638],
                [8.1869461, 60.1736877016638],
                [8.1668854, 60.1863532016666],
                [8.2087905, 60.188271801667],
                [8.2842698, 60.1751012016641],
                [8.3842811, 60.1811728016654],
                [8.4861057, 60.1687945016628],
                [8.5652144, 60.1772431016646],
                [8.6598735, 60.1720079016635],
                [8.7228636, 60.1831069016659],
                [8.7690423, 60.170005501663],
                [8.8093287, 60.1527548016592],
                [8.832766, 60.1494184016584],
                [8.9578697, 60.0980607016466],
                [8.9570792, 60.0923647016452],
                [8.978115, 60.0701086016399],
                [8.9879618, 60.0174497016267],
                [9.00242, 59.9968160016214],
                [8.9874884, 59.9905657016198],
                [8.992795, 59.9807714016172],
                [9.0192112, 59.984031601618],
                [9.0543784, 59.9694178016141],
                [9.0585837, 59.9619788016121],
                [9.1042738, 59.9589297016113],
                [9.112124, 59.950458301609],
                [9.1393019, 59.939288001606],
                [9.1795079, 59.9290581016032],
                [9.1925944, 59.9168138015998],
                [9.1742916, 59.900016401595],
                [9.1885699, 59.8969058015941],
                [9.1788003, 59.8656237015852],
                [9.1885612, 59.8418798015782],
                [9.1860885, 59.8269874015738],
                [9.2357063, 59.8118739015693],
                [9.2534108, 59.8138193015698],
                [9.2637947, 59.8066370015677],
                [9.3129599, 59.7983214015652],
                [9.3677548, 59.7813389015599],
                [9.3440947, 59.7572982015525],
                [9.3460341, 59.7350755015454],
                [9.33896, 59.7195056015404],
                [9.3547866, 59.71824920154],
                [9.3332915, 59.6927762015318],
                [9.4052839, 59.6845351015291],
                [9.405566, 59.6588280015206],
                [9.4230061, 59.6410015015146],
                [9.4644597, 59.5667553014891],
                [9.4719837, 59.5573545014857],
                [9.5152635, 59.5381148014789],
                [9.468579, 59.4943073014631],
                [9.4717443, 59.4822113014588],
                [9.5234755, 59.48572820146],
                [9.535736, 59.4835789014592],
                [9.552032, 59.4872544014606],
                [9.5845995, 59.4664182014529],
                [9.5788867, 59.4621958014513],
                [9.5868356, 59.4506350014471],
                [9.6213751, 59.4384354014425],
                [9.6246208, 59.4249008014374],
                [9.6601197, 59.407871001431],
                [9.7780874, 59.4120021014325],
                [9.758502, 59.4582786014499],
                [9.7751284, 59.4570315014494],
                [9.8191125, 59.4691838014539],
                [9.8454345, 59.4635464014518],
                [9.8529473, 59.4583299014499],
                [9.8748035, 59.4599559014505],
                [9.9201333, 59.4555240014489],
                [9.9372086, 59.4595063014503],
                [9.9447787, 59.4682881014536],
                [9.9983187, 59.4669990014531],
                [10.0013179, 59.4605480014507],
                [10.0118252, 59.45848030145],
                [10.0224264, 59.4608591014508],
                [10.0228639, 59.4646561014523],
                [10.0599676, 59.4730291014554],
                [10.0249898, 59.5123473014697],
                [9.9888537, 59.5306409014763],
                [9.9427779, 59.5678310014894],
                [9.9153293, 59.5824841014946],
                [9.941838, 59.5869186014961],
                [9.9329308, 59.603872901502],
                [9.9810739, 59.6179519015068],
                [9.9746385, 59.6325787015118],
                [9.9865698, 59.6389707015139],
                [9.9828976, 59.6435750015155],
                [9.9998083, 59.6564995015198],
                [9.9981678, 59.6638233015222],
                [10.0191234, 59.6580262015203],
                [10.0374635, 59.6405328015145],
                [10.0521738, 59.6438621015156],
                [10.0889085, 59.6425687015151],
                [10.0985711, 59.6560670015197],
                [10.1115125, 59.6607270015212],
                [10.1155146, 59.6706672015245],
                [10.1362233, 59.6716981015248],
                [10.157232, 59.6658207015229],
                [10.160213, 59.669143301524],
                [10.1798348, 59.6680078015236],
                [10.1928391, 59.6718999015249],
                [10.2189634, 59.6638318015223],
                [10.2245032, 59.6712873015247],
                [10.2386117, 59.6664090015231],
                [10.2440185, 59.6727018015252],
                [10.2613538, 59.6738802015256],
                [10.299599, 59.669066101524],
                [10.3020265, 59.6643874015224],
                [10.3172241, 59.6606555015212],
                [10.3366089, 59.630435501511],
                [10.3309076, 59.6059015015027],
                [10.3431768, 59.5651453014885],
                [10.3668468, 59.5419831014803],
                [10.3731613, 59.5426877014806],
                [10.3782625, 59.5363247014783],
                [10.3980153, 59.5304326014762],
                [10.3936911, 59.5146894014705],
                [10.4558138, 59.4798834014579],
                [10.5430597, 59.4573270014495],
                [10.5366786, 59.4327758014404],
                [10.5440317, 59.4123005014327],
                [10.5841619, 59.3930639014254],
                [10.5952746, 59.3741407014181],
                [10.5944326, 59.3561877014111],
                [10.5782449, 59.3409356014052],
                [10.590795, 59.297219701388],
                [10.5903316, 59.2684833013764],
                [10.6550502, 59.1919576013452],
                [10.6509765, 59.1328154013205],
                [10.6227162, 59.1117032013116],
                [10.6750198, 59.045288001283],
                [10.6285289, 58.9545929012431],
                [10.5930952, 58.7609604011546],
                [10.6389238, 58.892275801215],
                [10.9179084, 58.9422722012376],
                [10.9831935, 58.9604496012457],
                [11.0664174, 58.9773944012532],
                [11.0923814, 58.9918054012595],
                [11.1171483, 59.0150594012698],
                [11.1535062, 59.0792568012977],
                [11.2890427, 59.0995769013064],
                [11.339912, 59.114979301313],
                [11.36841, 59.0984367013059],
                [11.4141986, 59.0396952012805],
                [11.4645982, 58.9911521012593],
                [11.4538742, 58.9854673012568],
                [11.4623248, 58.9730566012513],
                [11.4636597, 58.9332617012335],
                [11.4558126, 58.8891832012136],
                [11.5001149, 58.8893821012137],
                [11.5177408, 58.8794806012092],
                [11.5374131, 58.8774183012083],
                [11.5337089, 58.8860723012122],
                [11.5533985, 58.8989319012181],
                [11.5724948, 58.887825401213],
                [11.5778222, 58.8974944012174],
                [11.5906295, 58.8907158012143],
                [11.6304263, 58.9086151012225],
                [11.652003, 58.9062334012214],
                [11.658171, 58.9317617012329],
                [11.6758604, 58.9350644012343],
                [11.6733816, 58.9419574012374],
                [11.6890826, 58.9568451012441],
                [11.684432, 58.9743846012519],
                [11.6936412, 58.9777759012534],
                [11.6839138, 58.9899989012588],
                [11.6983799, 59.0005611012635],
                [11.7105158, 59.033675601278],
                [11.7762262, 59.0879940013014],
                [11.7809176, 59.0996303013064],
                [11.7636244, 59.1145374013128],
                [11.7780154, 59.1360436013219],
                [11.7746876, 59.1706681013364],
                [11.7832574, 59.2072502013515],
                [11.8002305, 59.2250136013588],
                [11.8297963, 59.2416072013656],
                [11.8162451, 59.3447445014067],
                [11.7798653, 59.3864596014228],
                [11.7741111, 59.4142916014334],
                [11.7609527, 59.4286034014388],
                [11.7532071, 59.4793693014577],
                [11.7286375, 59.5111751014693],
                [11.6911282, 59.589548701497],
                [11.6979641, 59.6087812015037],
                [11.7205576, 59.6254877015094],
                [11.7788924, 59.6429945015153],
                [11.8556139, 59.648290701517],
                [11.8892165, 59.6932083015319],
                [11.9398779, 59.6945798015324],
                [11.9449169, 59.6982383015336],
                [11.9370468, 59.7004707015343],
                [11.9376875, 59.7284109015433],
                [11.9230259, 59.7499405015501],
                [11.9336585, 59.7601874015533],
                [11.9266873, 59.7923369015633],
                [11.8844303, 59.8249991015732],
                [11.8533418, 59.8302472015748],
                [11.8338792, 59.8424109015784],
                [11.8357363, 59.8632315015845],
                [11.820725, 59.8736548015875],
                [11.8250373, 59.8802730015894],
                [11.8169862, 59.8834761015904],
                [11.8230351, 59.892789001593],
                [11.8124626, 59.8924148015929],
                [11.8048193, 59.8986089015947],
                [11.802595, 59.9194749016005],
                [11.8214082, 59.9302983016035],
                [11.7930745, 59.9572367016109],
                [11.8107315, 59.9890838016194],
                [11.8345955, 59.9979624016217],
                [11.8392866, 60.0159332016263],
                [11.8193856, 60.0236337016283],
                [11.8180613, 60.058501701637],
                [11.7914664, 60.0477837016344],
                [11.7858176, 60.066686801639],
                [11.7907747, 60.0720540016403],
                [11.7814527, 60.0780072016418],
                [11.7780805, 60.0897376016446],
                [11.7644567, 60.0921968016452],
                [11.7638096, 60.0962644016462],
                [11.7350109, 60.0960643016461],
                [11.6980109, 60.1112530016497],
                [11.6525157, 60.1230423016524],
                [11.5907771, 60.1605360016609],
                [11.5841429, 60.1732245016637],
                [11.5623718, 60.1759690016643],
                [11.5613456, 60.183696501666],
                [11.5822431, 60.2002630016695],
                [11.5808632, 60.2373259016772],
                [11.5986212, 60.2528799016803],
                [11.6018948, 60.2672873016831],
                [11.5181497, 60.2964527016887],
                [11.4743935, 60.3320184016952],
                [11.4529107, 60.3323966016952],
                [11.4326054, 60.3396139016965],
                [11.4184921, 60.3677467017014],
                [11.4006127, 60.3785954017032],
                [11.342259, 60.4587985017155],
                [11.2972304, 60.4686837017169],
                [11.2520913, 60.4950132017206],
                [11.2095645, 60.5049144017218],
                [11.2190657, 60.5422568017265],
                [11.214673, 60.563812801729],
                [11.153986, 60.6051478017335],
                [11.1319621, 60.5963750017326],
                [11.107827, 60.5696696017297],
                [11.1129925, 60.5613552017288],
                [11.1100963, 60.5576489017283],
                [11.1041379, 60.5588943017285],
                [11.0971973, 60.5359237017258],
                [11.100989, 60.5259158017245],
                [11.092592, 60.5167690017234],
                [11.067134, 60.5186682017236],
                [10.9871094, 60.4975554017209],
                [10.9807159, 60.5001103017212],
                [10.9445662, 60.4874289017195],
                [10.9544868, 60.4848270017192],
                [10.9498256, 60.4784212017183],
                [10.9407745, 60.4748543017178],
                [10.9262015, 60.4758366017179],
                [10.9225672, 60.4705818017172],
                [10.9155051, 60.4747658017178],
                [10.8643978, 60.4796428017185],
                [10.834216, 60.4784952017183],
                [10.8019678, 60.4876603017195],
                [10.7794254, 60.4891690017198],
                [10.7603214, 60.4939592017204],
                [10.7244512, 60.5185715017236],
                [10.7135807, 60.5241894017243],
                [10.7108013, 60.522143801724],
                [10.7113027, 60.4971570017208],
                [10.6924131, 60.4920255017201],
                [10.7101951, 60.4539732017148],
                [10.689521, 60.4474074017139],
                [10.6719777, 60.4338571017119],
                [10.6872905, 60.4308061017114],
                [10.7202856, 60.434342001712],
                [10.767464, 60.4261758017107],
                [10.80897, 60.4241575017104],
                [10.8195235, 60.4273718017109],
                [10.9031094, 60.396292201706],
                [10.8981615, 60.3906838017051],
                [10.9020885, 60.3780729017031],
                [10.9339027, 60.3466920016978],
                [10.8828336, 60.3187245016928],
                [10.8723112, 60.3208246016932],
                [10.8647392, 60.313925001692],
                [10.7630723, 60.3140778016919],
                [10.7198496, 60.3295303016948],
                [10.7235348, 60.3346710016957],
                [10.7153665, 60.3391150016965],
                [10.7047219, 60.3297951016948],
                [10.6943443, 60.3314086016951],
                [10.6863538, 60.3263284016942],
                [10.6704956, 60.3277716016945],
                [10.6451462, 60.3230577016936],
                [10.6332049, 60.3256721016941],
                [10.6291093, 60.3208622016932],
                [10.6174897, 60.3215243016933],
                [10.6050621, 60.3121091016916],
                [10.60109, 60.3222587016934],
                [10.5850843, 60.3180601016927],
                [10.5800487, 60.3243133016938],
                [10.5592932, 60.3206533016931],
                [10.5579654, 60.3258495016941],
                [10.54738, 60.3276166016944],
                [10.5262895, 60.325347101694],
                [10.5250119, 60.3217919016934],
                [10.5100705, 60.325655501694],
                [10.4705228, 60.3223609016935],
                [10.4572373, 60.3167397016925],
                [10.4231467, 60.3126539016917],
                [10.4135907, 60.3138389016919],
                [10.4146574, 60.3181104016927],
                [10.3835372, 60.3170477016925],
                [10.3662759, 60.3209753016932],
                [10.3652964, 60.3278122016944],
                [10.3856608, 60.3558052016993],
                [10.3884874, 60.3752254017026],
                [10.3534811, 60.3726641017022],
                [10.3388744, 60.3661409017011],
                [10.2612046, 60.3936223017056],
                [10.2020766, 60.3923005017054],
                [10.2082807, 60.3989133017064],
                [10.1942727, 60.4003096017067],
                [10.1897379, 60.4093809017081],
                [10.1732452, 60.4671300017167],
                [10.1761892, 60.4784300017183],
                [10.1563752, 60.5221931017241],
                [10.1248062, 60.5355283017257],
                [10.107284, 60.5494596017274],
                [10.1093288, 60.5558664017281],
                [10.0940549, 60.5595666017285],
                [10.0647891, 60.6078017017337],
                [10.0353299, 60.6320550017361],
                [9.9659474, 60.6378691017366],
                [9.9209243, 60.6334565017362],
                [9.9062222, 60.6350980017364],
                [9.9206001, 60.619898301735],
                [9.9314291, 60.6152126017345],
                [9.9481475, 60.6145025017344],
                [9.9522667, 60.6108953017341],
                [9.9436627, 60.6030332017333],
                [9.8844512, 60.5853624017314],
                [9.853391, 60.5676948017295],
                [9.8427578, 60.5786887017307],
                [9.8432436, 60.5866400017315],
                [9.8323006, 60.5797260017308],
                [9.8104732, 60.5560568017281],
                [9.8172021, 60.5258237017245],
                [9.810957, 60.5119963017228],
                [9.8258668, 60.4929794017203],
                [9.8305002, 60.4564215017152],
                [9.8008963, 60.4542329017149],
                [9.723429, 60.4724397017175],
                [9.7185409, 60.4707788017172],
                [9.7176623, 60.4738215017176],
                [9.6117851, 60.5003427017212],
                [9.6199827, 60.5077744017222],
                [9.6070696, 60.5388551017261],
                [9.52087, 60.5321331017253],
                [9.5143151, 60.5277558017247],
                [9.4839074, 60.5286796017248],
                [9.4486457, 60.5438425017267],
                [9.4171286, 60.5477691017271],
                [9.4105882, 60.5827549017311],
                [9.4351443, 60.5995644017329],
                [9.4213481, 60.6130109017342],
                [9.3960459, 60.6149974017344],
                [9.3788236, 60.6213137017351],
                [9.3615806, 60.6360863017364],
                [9.36617, 60.6479364017375],
                [9.352647, 60.6671174017392],
                [9.3213172, 60.6794900017402],
                [9.3180312, 60.6989949017417],
                [9.3288463, 60.7083412017423],
                [9.3321101, 60.7299042017438],
                [9.3046445, 60.7450993017448],
                [9.2913036, 60.7618630017457],
                [9.216259, 60.7705734017462],
                [9.1928766, 60.7908721017472],
                [9.1469068, 60.8068311017479],
                [9.0888188, 60.8164663017483],
                [9.0161107, 60.8400014017491],
                [8.918991, 60.8633761017497],
                [8.8905852, 60.8966213017503],
                [8.8144912, 60.9005856017504],
                [8.6540522, 60.9359465017506],
                [8.6572278, 60.9391596017506],
                [8.6210856, 60.9519029017506],
                [8.6327856, 60.9616448017505],
                [8.6264324, 60.9713448017505],
                [8.6079402, 60.9822768017503],
                [8.5806205, 60.9937978017501],
                [8.5689682, 60.9946520017501],
                [8.5432504, 61.0097372017498],
                [8.5125799, 61.0126693017497],
                [8.5094922, 61.0184080017496],
                [8.4807122, 61.0216765017495],
                [8.4679814, 61.0185898017496],
                [8.4465432, 61.0199155017496],
                [8.4327238, 61.0278178017493],
                [8.3663346, 61.0482635017487],
                [8.3092038, 61.0917205017468],
                [8.2699657, 61.0814554017473],
                [8.2144336, 61.0539106017485],
                [8.2399922, 61.0495747017486],
                [8.2826614, 61.0333307017491],
                [8.2573317, 61.0085430017498],
                [8.2287168, 61.0090228017498],
                [8.2208749, 61.0042927017499],
                [8.2211516, 60.99962050175],
                [8.2328165, 60.9945644017501],
                [8.2231107, 60.9680888017505],
                [8.1838692, 60.9690032017505],
                [8.1539422, 60.9822326017503],
                [8.0408723, 60.8932150017503],
                [7.9800696, 60.9016424017504],
                [7.9352049, 60.8972551017504],
                [7.879035, 60.9240476017506],
                [7.8515154, 60.9199227017506],
                [7.8030271, 60.8967345017503],
                [7.704432, 60.7927721017473],
                [7.7215405, 60.7900715017472],
                [7.726235, 60.7611312017457],
                [7.7044082, 60.7391205017444],
                [7.6852225, 60.732010601744],
                [7.6146987, 60.7441943017447],
                [7.4388425, 60.6600393017386]
              ],
              [
                [10.4891652, 60.0172599016267],
                [10.5807649, 60.0762384016414],
                [10.597304, 60.0772801016416],
                [10.5886572, 60.1002950016471],
                [10.5727825, 60.116784801651],
                [10.6039492, 60.1338598016549],
                [10.6803196, 60.1335303016548],
                [10.7044717, 60.1251895016529],
                [10.7072627, 60.1194034016516],
                [10.7344496, 60.125521501653],
                [10.7469401, 60.1230264016524],
                [10.7683726, 60.1123655016499],
                [10.7548497, 60.1002467016471],
                [10.7643713, 60.0962689016462],
                [10.7867839, 60.0682464016394],
                [10.8196314, 60.0647155016385],
                [10.8117058, 60.0254666016288],
                [10.821145, 60.0173781016267],
                [10.8283348, 60.0221516016279],
                [10.8376886, 59.9980355016217],
                [10.849278, 60.0020227016227],
                [10.875393, 59.9855885016184],
                [10.8931551, 59.9808021016171],
                [10.9256503, 59.9837243016179],
                [10.9413355, 59.9543974016101],
                [10.9513894, 59.9492430016087],
                [10.9426049, 59.9470392016081],
                [10.9459879, 59.943169601607],
                [10.9214162, 59.9264750016025],
                [10.9076279, 59.8849578015907],
                [10.9093487, 59.8647527015849],
                [10.9366088, 59.8317021015752],
                [10.9273965, 59.8268668015738],
                [10.8977154, 59.824342101573],
                [10.880014, 59.811005101569],
                [10.8696685, 59.8132162015697],
                [10.8562995, 59.8093113015685],
                [10.8459257, 59.8168798015708],
                [10.8172601, 59.8181292015712],
                [10.812456, 59.8253619015733],
                [10.7984454, 59.8229811015726],
                [10.7775228, 59.8262397015736],
                [10.7715533, 59.8235061015727],
                [10.7440197, 59.8392832015775],
                [10.7310066, 59.8771786015885],
                [10.6889625, 59.8759281015882],
                [10.6580825, 59.8844105015906],
                [10.6477656, 59.9094077015977],
                [10.6333474, 59.9144418015991],
                [10.6256897, 59.9227085016014],
                [10.6356154, 59.9478453016083],
                [10.6139561, 59.9743235016155],
                [10.5906537, 59.9771701016162],
                [10.5558552, 59.9967266016213],
                [10.549119, 59.9936568016206],
                [10.5352737, 60.0005520016224],
                [10.5180704, 59.999291201622],
                [10.4891652, 60.0172599016267]
              ]
            ]
          ]
        }
      
    
  };


  constructor(private readonly mapHelperService: MapHelperService) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

  onFreedrawMenuClick(): void {
    this.mapHelperService.freedrawMenuClick();
  }
  onSubtractClick(): void {
    this.mapHelperService.subtractClick();
  }

  add0254() {
    this.mapHelperService.addAutoPolygon(this.pn0254 as any);
  }

  add0252() {
    this.mapHelperService.addAutoPolygon(this.pn0252 as any);
  }

  add0253() {
    this.mapHelperService.addAutoPolygon(this.pn0253 as any);
  }

  addHomansbyen() {
    this.mapHelperService.addAutoPolygon(this.homansbyen as any);
  }

  addViken(){
    this.mapHelperService.addViken(this.viken);
  }
  
}
