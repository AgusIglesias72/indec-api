interface Parameter {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }
  
  interface ParameterTableProps {
    parameters: Parameter[];
  }
  
  export default function ParameterTable({ parameters }: ParameterTableProps) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requerido
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parameters.map((param, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {param.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <code className="bg-gray-100 px-2 py-1 rounded">{param.type}</code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {param.required ? (
                    <span className="text-red-600">Sí</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {param.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }