import { useState } from "react";
import { useMyContext } from "../context/Context";
import type { SavedProject } from "../types";

interface ExportPDFProps {
    project: SavedProject;
}

function ExportPDF({ project }: ExportPDFProps) {
    const { myProfil } = useMyContext();
    const [isExporting, setIsExporting] = useState(false);

    const generatePDF = async () => {
        setIsExporting(true);

        try {
            // Créer le contenu HTML pour le PDF
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #0D6EFD; text-align: center; }
                        h2 { color: #0D6EFD; border-bottom: 2px solid #0D6EFD; padding-bottom: 5px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                        .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #0D6EFD; color: white; }
                        .ravito-section { margin: 30px 0; page-break-inside: avoid; }
                        .footer { text-align: center; margin-top: 50px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${project.name}</h1>
                        <p><strong>Parcours:</strong> ${project.nameRun || 'Non défini'}</p>
                    </div>

                    <div class="stats">
                        <div class="stat-box">
                            <h3>Distance</h3>
                            <p><strong>${project.distanceTotal.toFixed(1)} km</strong></p>
                        </div>
                        <div class="stat-box">
                            <h3>D+</h3>
                            <p><strong>${project.denivelePositif.toFixed(0)} m</strong></p>
                        </div>
                        <div class="stat-box">
                            <h3>D-</h3>
                            <p><strong>${project.deniveleNegatif.toFixed(0)} m</strong></p>
                        </div>
                        <div class="stat-box">
                            <h3>Ravitaillements</h3>
                            <p><strong>${project.ravitos.length}</strong></p>
                        </div>
                    </div>

                    <h2>Ravitaillements détaillés</h2>
                    
                    ${project.ravitos.map(ravito => `
                        <div class="ravito-section">
                            <h3>${ravito.name} - ${ravito.distance} km ${ravito.temps > 0 ? `(${ravito.temps}h)` : ''}</h3>
                            
                            ${ravito.items.length > 0 ? `
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Protéines (g)</th>
                                            <th>Glucides (g)</th>
                                            <th>Quantité</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${ravito.items.map(item => `
                                            <tr>
                                                <td>${item.name}</td>
                                                <td>${item.proteine * item.quantity}</td>
                                                <td>${item.glucide * item.quantity}</td>
                                                <td>${item.quantity}</td>
                                                <td>${item.status}</td>
                                            </tr>
                                        `).join('')}
                                        <tr style="font-weight: bold; background-color: #f0f0f0;">
                                            <td>TOTAL</td>
                                            <td>${ravito.items.reduce((sum, item) => sum + (item.proteine * item.quantity), 0)}</td>
                                            <td>${ravito.items.reduce((sum, item) => sum + (item.glucide * item.quantity), 0)}</td>
                                            <td>${ravito.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                            <td></td>
                                        </tr>
                                        ${ravito.temps > 0 ? `
                                            <tr style="font-weight: bold; background-color: #e3f2fd;">
                                                <td>BESOINS ESTIMÉS</td>
                                                <td>${(myProfil?.consProt || 5) * ravito.temps}</td>
                                                <td>${(myProfil?.consGlu || 40) * ravito.temps}</td>
                                                <td colspan="2"></td>
                                            </tr>
                                        ` : ''}
                                    </tbody>
                                </table>
                            ` : '<p><em>Aucun item pour ce ravitaillement</em></p>'}
                        </div>
                    `).join('')}

                    <div class="footer">
                        <p>Généré par RaviTrail - ${new Date().toLocaleDateString('fr-FR')}</p>
                        <p>Profil nutritionnel: ${myProfil?.consGlu || 40}g glucides/h - ${myProfil?.consProt || 5}g protéines/h</p>
                    </div>
                </body>
                </html>
            `;

            // Créer un Blob et télécharger
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_ravitaillement.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert('✓ Export HTML généré ! Ouvrez le fichier dans votre navigateur et utilisez "Imprimer > Enregistrer en PDF" pour obtenir un PDF.');
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            alert('❌ Erreur lors de l\'export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            className="btn btn-success"
            onClick={generatePDF}
            disabled={isExporting}
        >
            {isExporting ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Export en cours...
                </>
            ) : (
                <>
                    📄 Exporter en PDF
                </>
            )}
        </button>
    );
}

export default ExportPDF;