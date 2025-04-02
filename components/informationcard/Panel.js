import { useState } from "react";
import { CircleX, Menu } from 'lucide-react';

export default function Panel({panelOpen, session, dynamicData, setDynaicData, setPanelOpen}) {
    const [activeSection, setActiveSection] = useState('Frage anzeigen');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { title: 'Fragen', subItems: ['Anlegen', 'Anzeigen'] },
        { title: 'Spieler', subItems: ['Anzeigen', 'Einladen'] },
        { title: 'Spiel', subItems: ['Anzeigen', 'Auswählen', 'Erstellen', 'Einstellungen'] },
    ];


    return (
        <>
            {panelOpen & dynamicData === "admin" && (
                  
                  <div className="absolute top-1/2 left-1/2 lg:w-1/2 lg:h-3/4 w-full h-full flex border bg-gray-100 rounded-2xl shadow-xl transform -translate-x-1/2 -translate-y-1/2 overflow-hidden dark:bg-gray-900">
                  <button
                      className="absolute top-4 right-4 lg:hidden z-50 p-2 bg-blue-500 text-white rounded-full"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {isMenuOpen ? (
                        <CircleX></CircleX>
                        ) : (<Menu className="w-6 h-6" />)}

                  </button>
  
                  <div className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-40 transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden'} lg:block lg:relative lg:bg-transparent lg:bg-opacity-100`}>
                      <div className="w-3/4  lg:w-full h-full bg-gray-100 p-8 flex flex-col border-r border-gray-300 dark:bg-gray-900 ">
                          {menuItems.map((item) => (
                              <div key={item.title} className="mb-4">
                                  <h2 className="font-bold mb-2 text-white">{item.title}</h2>
                                  <div className="flex flex-col space-y-1">
                                      {item.subItems.map((subItem) => (
                                          <button
                                              key={subItem}
                                              className={`p-2 pr-12 text-left rounded ${activeSection === subItem ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                                              onClick={() => {
                                                  setActiveSection(subItem);
                                                  setIsMenuOpen(false); 
                                              }}
                                          >
                                              {subItem}
                                          </button>
                                      ))}
                                     
                                  </div>
                              </div>
                          ))}
                           <button 
                            className={`p-2 pr-12 text-left rounded cursor-pointer absolute bottom-0 left-0`}>
                                 <CircleX  onClick={() => setPanelOpen(false)} />
                            </button>
                      </div>
                  </div>
  

                  <div className="w-full lg:w-3/4 h-full p-4">
                      {activeSection === 'Anlegen' && <div>Anlegen Inhalt</div>}
                      {activeSection === 'Anzeigen' && <div>Anzeigen Inhalt</div>}
                  </div>
              </div>

        

            )}
            {panelOpen & dynamicData === 'statistic' && (
                <div className="flex flex-col items-center justify-center w-full h-full p-4">
                    <h1 className="text-2xl font-bold">Statistic Panel</h1>
                    <p className="mt-2 text-gray-600">Manage your application settings here.</p>
                </div>
            )}
       </>
    );
    }