var app = angular.module('checkApp', ['ngRoute']);
app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'login.html',
        controller: 'LoginCtrl'
    });
    $routeProvider.when('/home', {
        templateUrl: 'home.html',
        controller: 'HomeCtrl'
    })
    $routeProvider.when('/profilbild_aendern', {
        templateUrl: 'profilbild_aendern.html',
        controller: 'HomeCtrl'
    });
    $routeProvider.when('/passwort_aendern', {
        templateUrl: 'passwort_aendern.html',
        controller: 'HomeCtrl'
    });
    $routeProvider.when('/profil_loeschen', {
        templateUrl: 'profil_loeschen.html',
        controller: 'HomeCtrl'
    });
    $routeProvider.otherwise({
        redirectTo: '/'
    });
});

app.run(function (authentication, $rootScope, $location) {
    console.log(authentication);
    $rootScope.$on('$routeChangeStart', function (event) {
        if (!authentication.isAuthenticated) {
            $location.path('/');
        }
        event.preventDefault();
    });
});
//Login Controller -> Zuständig für die Methoden die beim Login aufgerufen
app.controller('LoginCtrl', ["$scope", "$http", "$location", "authentication", function ($scope, $http, $location, authentication) {
    console.log("LOGINCONTROLLER");
    console.log(authentication);
    $scope.login = function () {
        $http({
            method: "PUT",
            url: "http://46.101.204.215:1337/api/V1/login",
            data: {
                username: $scope.username,
                password: $scope.password
            }
        }).then(function (response) {
            console.log("LOGIN");
            console.log(response.data);
            localStorage.setItem('token', response.data.token)
            $location.path('/home');
            authentication.isAuthenticated = true;
            authentication.token = localStorage.getItem('token')
            authentication.user = {
                name: $scope.username
            };
        }, function () {
            $scope.loginError = "Invalid username/password combination";
            console.log('Login failed..');
            alert("Login nicht erfolgreich Password und Username überprüfen!")
            authentication.isAuthenticated = false;
        });
    };
}]);
/*Home Controller(HauptController) -> Zuständig für die Methoden die auf der Main Page aufgerufen werden
/Hier haben wir das Problem das bei nur einem Controller beim Navigieren der durch Navbar man zweimal auf den Button den man möchte drücken muss da beim
/ersten Click nicht die Kompetenzen geladen werden Wir sind uns der Ursache dieses Problems bekannt. Lösüng wäre: Mehrere Controller statt nur einem für alle
für alle*/
app.controller('HomeCtrl', ["$scope", "$http", "$route","$location", "authentication", function ($scope, $http, $route, $location, authentication) {
    console.log("HOMECONTROLLER");
    console.log($location);
    console.log(authentication);
    var Home = this;
    Home.baseUrl = "http://46.101.204.215:1337";
    Home.loadChapters = function () {
        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/chapter",
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log("Chapters:")
            console.log(response.data);
            $scope.Chapters = response.data;

        });
    };
    //Methode zum Laden der Illustrationen vom Server.
    Home.loadIllus = function () {
        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/chapterillustrations/",
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log("Illustrations:")
            console.log(response.data);
            $scope.Illus = response.data;

        });
    };
    //Methode zum Laden der Kompetenzen vom Server in ein Array.
    Home.loadAllCompetences = function () {

        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/studentcompetence",
            headers: {
                'Authorization': localStorage.getItem('token')
            },

        }).then(function (response) {
            console.log("AllCompetences:")
            console.log(response.data);
            $scope.AllCompetences = response.data;
        });
    };
    /*Methode zum Laden der Kompetenzen eines ausgewählten
    Foerderplans vom Server in ein Array.*/
    Home.loadFoerderPlan = function () {

        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/educationalPlan",
            headers: {
                'Authorization': localStorage.getItem('token')
            },

        }).then(function (response) {
            console.log("Foerderplan:")
            console.log(response.data);
            $scope.FoerderPlan = response.data;
        });
    };
    //Methode zum Abfragen des Aktuell eingeloggten Benutzers vom Server
    Home.loadUser = function () {
        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/student",
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            $scope.User = response.data;
            console.log(response.data);
            //AktuellenAvatarLaden
            $http({
                method: "GET",
                url: Home.baseUrl + "/api/V1/avatar/" + $scope.User.avatarId,
                headers: {
                    'Authorization': localStorage.getItem('token')
                },
            }).then(function (response) {
                $scope.User.Avatar = response.data;
                console.log(response.data);
            });
        });
    };
    //Methode zum Löschen des Aktuell eingeloggten Benutzers nach erfolgreicher PasswortAbfrage
    $scope.deleteUser = function(password) {
        $http({
            method: "DELETE",
            url: Home.baseUrl + "/api/V1/student",
            data:{
              password:$scope.deletePassword
            },
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log(response.data);
            alert(response.data.message)
        });
    };
    /*Methode zum ändern des Passworts vom eingeloggten Benutzer nach erfolgreicher
    Passwort abfraage*/
    $scope.changePassword = function () {
      if($scope.newpassword==null || $scope.newpassword2==null){
        alert("Mindestens ein Feld ist leer!");
      }
      else{
        if($scope.newpassword==$scope.newpassword2){
          $http({
              method: "PUT",
              url: Home.baseUrl + "/api/V1/requestPasswordRecovery",
              data: {
                  oldpassword: $scope.oldpassword,
                  newpassword: $scope.newpassword
              },
              headers: {
                  'Authorization': localStorage.getItem('token')
              },
          }).then(function (response) {
              console.log(response.data);
              alert(response.data.message);
          });
        }
        else{
          alert("Passwörter stimmen nicht überein!");
        }
      }
    };
    //Methode zum zurücksetzen des Passworts vom aktuell eingeloggten Benutzer
    $scope.passwordRecovery = function () {
        $http({
            method: "PUT",
            url: Home.baseUrl + "/api/V1/passwordRecovery/reset",
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log(response.data);
        });
    };
    //Methode zum anzeigen der Kompetenzen eines ausgewählten
    //Foerderplans geordnet nach order.
    $scope.selectFoerderPlan = function (foerderplan) {
        $location.path("/home");
        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/educationalPlan/" + foerderplan._id,
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log("FoerderplanCompetences:")
            console.log(response.data);
            $scope.FoerderPlanCompetences = response.data;
            var FoerderPlanCompetences = response.data[0].competences;
            var filteredCompetences = [];
            for (var fCompetence in FoerderPlanCompetences) {
                for (var aCompetence in $scope.AllCompetences) {
                    if (FoerderPlanCompetences[fCompetence].competenceId == $scope.AllCompetences[aCompetence].id) {
                        var compiledCompetence = $scope.AllCompetences[aCompetence];
                        compiledCompetence.note = FoerderPlanCompetences[fCompetence].note;
                        compiledCompetence.order = FoerderPlanCompetences[fCompetence].order;
                        filteredCompetences.push(compiledCompetence);
                    }
                }
            }

          $scope.Competences = filteredCompetences;
          //Methode zum Ordnen nach Order
          $scope.Competences.sort(function(a, b){
              return a.order-b.order
            })
            console.log(filteredCompetences);
        });
    };
    //Methode zum Anzeigen aller Kompetenzen in einem bestimmten
    //Kapitel ob bestanden oder nicht bestanden geordnet nach Datum
    $scope.selectChapter = function (chapter) {
      $location.path('/home');
        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/studentcompetence?chapterId=" + chapter._id,
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log(response.data);
            $scope.Chapter = chapter;
            $scope.ChapterId = "";
            $scope.ChapterId += chapter._id;
            $scope.Competences = response.data;
            //Methode zum Ordnen nach fromDate
            $scope.Competences.sort(function(a, b){
            var dateA=new Date(a.fromDate), dateB=new Date(b.fromDate)
            return dateB-dateA //sort by date ascending
        });
        });
    };
    //Methode zum Anzeigen aller Kompetenzen ob bestande oder nicht bestanden
    //geordnet nach Datum
    $scope.selectAllCompetences = function (chapter) {
      $location.path("/home");
        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/studentcompetence",
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log("loadAllCompetencesThen");
            console.log(response.data);
            $scope.Chapter = chapter;
            $scope.ChapterId = "";
            $scope.ChapterId += chapter.chapterId;
            $scope.Competences = response.data;
            //Methode zum Ordnen nach fromDate
            $scope.Competences.sort(function(a, b){
            var dateA=new Date(a.fromDate), dateB=new Date(b.fromDate)
            return dateB-dateA //sort by date ascending
        });
        });
    };
    //Methode zum anzeigen der erreichten Kompetenzen
    //geordnet nach Datum
    $scope.selectChapterDone = function (chapter) {
        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/studentcompetence?checked=true&chapterId=" + chapter._id,
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log(response.data);
            $scope.Chapter = chapter;
            $scope.ChapterId = "";
            $scope.ChapterId += chapter._id;
            $scope.Competences = response.data;
            //Methode zum Ordnen nach fromDate
            $scope.Competences.sort(function(a, b){
            var dateA=new Date(a.fromDate), dateB=new Date(b.fromDate)
            return dateB-dateA //sort by date ascending
        });
        });
    };

    $scope.logout = function () {
        localStorage.clear();
        $location.path('/');
    };
    $scope.break = function () {
        $location.path('/home');
    };
    $scope.scrolldown = function () {
            window.scrollBy(0, 50);
    };
    $scope.scrollup = function () {
            window.scrollBy(0, -50);
    };
    //Methode zum laden der vom Server verfügbar gestellten Profilbildern
    Home.loadAvatars = function () {
        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/avatar",
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log(response.data);
            $scope.Avatars = response.data;
        });
    };
    //Laden des aktuell eingeloogten Studenten vom Server
    Home.loadUser = function () {
        $http({
            method: "GET",
            url: Home.baseUrl + "/api/V1/student",
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            $scope.User = response.data;
            console.log(response.data);
            //AktuellenAvatarLaden
            $http({
                method: "GET",
                url: Home.baseUrl + "/api/V1/avatar/" + $scope.User.avatarId,
                headers: {
                    'Authorization': localStorage.getItem('token')
                },
            }).then(function (response) {
                $scope.User.Avatar = response.data;
                console.log(response.data);
            });
        });
    };
    //Methode zum wechseln der Profilbilder von aktuell eingeloggtem Benutzer
    $scope.changeAvatar = function () {
        $http({
            method: "PUT",
            url: Home.baseUrl + "/api/V1/avatar/" + $scope.User.Avatar._id,
            headers: {
                'Authorization': localStorage.getItem('token')
            },
        }).then(function (response) {
            console.log(response.data);
            alert(response.data.message);
        });
    };
    //Methode zum auswählen des zu Speichernden Avatars.
    //(auswählen welcher Avatar der neue Avatar des Profil´s wird)
    $scope.pChange = function (A) {
        $scope.User.Avatar = A;
    };
    //Aufrufe zum laden der nötigen Informationen
    //vom Server die zur Weiterverarbeitung verwendet werden
    Home.loadAvatars();
    Home.loadUser();
    Home.loadAllCompetences();
    Home.loadChapters();
    Home.loadFoerderPlan();
    Home.loadUser();
    Home.loadIllus();
}]);

app.factory('authentication', function () {
    console.log("AuthenticationCONTROLLER");
    return {
        isAuthenticated: false,
        user: null,
        token: null
    }
});
