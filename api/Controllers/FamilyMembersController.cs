using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace BudgetApi.Controllers
{
    [ApiController]
    [Route("api/familymembers")]
    public class FamilyMembersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FamilyMembersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentMember()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var member = await _context.FamilyMembers
                .FirstOrDefaultAsync(m => m.UserId == userId);

            return member == null
                ? Ok(new { isMember = false, message = "User is not linked to any member" })
                : Ok(new { isMember = true, member });
        }

        // GET: api/familymembers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyMember>>> GetFamilyMembers(string familyId)
        {
            return await _context.FamilyMembers.Where(f => f.FamilyId == familyId).ToListAsync();
        }

        // POST: api/familymembers
        [HttpPost]
        public async Task<ActionResult<FamilyMember>> PostFamilyMember([FromBody] FamilyMemberDto memberDto)
        {
            // Валидация
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Создаем нового члена семьи
            var member = new FamilyMember
            {
                Name = memberDto.Name,
                RelationshipType = memberDto.RelationshipType,
                IncomeTypes = memberDto.IncomeTypes ?? new List<string>(),
                UserId = memberDto.UserId,
                FamilyId = memberDto.FamilyId,
                Role = memberDto.Role ?? "member"
            };

            _context.FamilyMembers.Add(member);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFamilyMembers), new { id = member.Id }, member);
        }

        // DELETE: api/familymembers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFamilyMember(string id)
        {
            var member = await _context.FamilyMembers.FindAsync(id);
            if (member == null) return NotFound();

            _context.FamilyMembers.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

public class FamilyMemberDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = null!;
    
    [Required]
    public string RelationshipType { get; set; } = null!;

    public List<string>? IncomeTypes { get; set; }
    
    public string? UserId { get; set; } = null!;
    
    [Required]
    public string FamilyId { get; set; } = null!;

    public string? Role { get; set; }
}