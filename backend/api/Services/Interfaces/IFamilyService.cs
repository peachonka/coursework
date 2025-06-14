using BudgetApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BudgetApi.Services
{
    public interface IFamilyService
    {
        Task<Family> CreateFamily(string creatorId, string name, string relationshipType, List<string> incomeTypes);
    }
}